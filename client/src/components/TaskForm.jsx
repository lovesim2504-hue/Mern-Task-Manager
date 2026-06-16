import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useForm, Controller } from 'react-hook-form';
import { API_BASE_URL } from '../util';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import {
  Stack,
  Flex,
  FormControl,
  FormErrorMessage,
  Input,
  Textarea,
  Select,
  Button,
  Text,
  Box,
} from '@chakra-ui/react';

export default function TaskForm({ type, task }) {
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [fileOption, setFileOption] = useState('keep');

  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues:
      type === 'update'
        ? {
            ...task,
            due: task?.due ? new Date(task.due) : null,
          }
        : {},
  });

  const navigate = useNavigate();

  // ✅ Sync file option on load
  useEffect(() => {
    if (type === 'update' && task?.assignment) {
      setFileOption('keep');
    }
  }, [task, type,reset]);

  // ✅ Reset file when option changes
  useEffect(() => {
    setAssignmentFile(null);
  }, [fileOption]);

  // ✅ FILE UPLOAD
  const handleAssignmentUpload = async (file) => {
    const formData = new FormData();
    formData.append('assignment', file);

    const res = await fetch(`${API_BASE_URL}/assignment/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data.fileUrl;
  };

  // ✅ SUBMIT
  const doSubmit = async (values) => {
    try {
      // ✅ Convert date
      if (values.due) {
        values.due = new Date(values.due).toISOString();
      }

      // ================= FILE LOGIC =================
      if (type === 'create') {
        if (assignmentFile) {
          const fileUrl = await handleAssignmentUpload(assignmentFile);
          values.assignment = fileUrl;
        }
      }

      if (type === 'update') {
        if (fileOption === 'new') {
          if (!assignmentFile) {
            toast.error('Please select a file');
            return;
          }
          const fileUrl = await handleAssignmentUpload(assignmentFile);
          values.assignment = fileUrl;
        } else {
          values.assignment = task?.assignment;
        }
      }

      // ================= CREATE =================
      if (type === 'create') {
        const res = await fetch(`${API_BASE_URL}/tasks/create`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });

        const data = await res.json();

        if (res.ok) {
          toast.success(`Task Created: ${values.name}`);
          navigate('/tasks');
        } else {
          toast.error(data.message);
        }
      }

      // ================= UPDATE =================
      if (type === 'update') {
        const payload = { ...values };
        delete payload._id;

        console.log('UPDATE PAYLOAD:', payload);

        const res = await fetch(`${API_BASE_URL}/tasks/${task._id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok) {
          toast.success(`Task Updated: ${values.name}`);
          navigate('/tasks');
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Something went wrong ❌');
    }
  };

  return (
    <form onSubmit={handleSubmit(doSubmit)}>
      <Stack direction={{ base: 'column', md: 'row' }} gap="4">

        {/* LEFT */}
        <Flex direction="column" flex="1" gap="4">

          <FormControl isInvalid={errors.name}>
            <Input
              placeholder="Task Name"
              {...register('name', { required: 'Task Name is required' })}
            />
            <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.description}>
            <Textarea
              placeholder="Description"
              rows={4}
              {...register('description', {
                required: 'Description is required',
              })}
            />
            <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
          </FormControl>

          {/* FILE SECTION */}
          <FormControl>

            {/* OPTIONS */}
            {type === 'update' && task?.assignment && (
              <>
                <Text mb="2" fontWeight="medium">
                  Choose File Option:
                </Text>

                <Flex gap="4">
                  <label>
                    <input
                      type="radio"
                      checked={fileOption === 'keep'}
                      onChange={() => setFileOption('keep')}
                    />
                    {' '}Use Previous
                  </label>

                  <label>
                    <input
                      type="radio"
                      checked={fileOption === 'new'}
                      onChange={() => setFileOption('new')}
                    />
                    {' '}Upload New
                  </label>
                </Flex>
              </>
            )}

            {/* SHOW OLD FILE */}
            {type === 'update' && task?.assignment && fileOption === 'keep' && (
              <Box mt="3">
                <Text fontSize="sm">📄 Current File:</Text>

                <Flex gap="2" mt="1">
                  <a href={task.assignment} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" colorScheme="blue">
                      View
                    </Button>
                  </a>

                  <a href={task.assignment} download>
                    <Button size="sm" colorScheme="green">
                      Download
                    </Button>
                  </a>
                </Flex>
              </Box>
            )}

            {/* NEW FILE */}
            {(type === 'create' || fileOption === 'new') && (
              <>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setAssignmentFile(e.target.files[0])}
                />

                {assignmentFile && (
                  <Text mt="2">📄 {assignmentFile.name}</Text>
                )}
              </>
            )}

          </FormControl>
        </Flex>

        {/* RIGHT */}
        <Flex direction="column" flex="1" gap="4">

          <FormControl isInvalid={errors.priority}>
            <Select
              placeholder="Priority"
              {...register('priority', { required: 'Required' })}
            >
              <option value="urgent">Urgent</option>
              <option value="not urgent">Not Urgent</option>
            </Select>
          </FormControl>

          <FormControl isInvalid={errors.status}>
            <Select
              placeholder="Status"
              {...register('status', { required: 'Required' })}
            >
              <option value="open">Open</option>
              <option value="done">Done</option>
            </Select>
          </FormControl>

          <FormControl>
            <Controller
              control={control}
              name="due"
              render={({ field }) => (
                <Input
                  as={DatePicker}
                  {...field}
                  selected={field.value}
                  showTimeSelect
                  dateFormat="MM/dd/yyyy h:mm aa"
                  placeholderText="Due Date"
                />
              )}
            />
          </FormControl>

          <Button type="submit" isLoading={isSubmitting} colorScheme="teal">
            Submit
          </Button>
        </Flex>

      </Stack>
    </form>
  );
}