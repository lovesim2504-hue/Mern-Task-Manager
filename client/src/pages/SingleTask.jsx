import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../util';
import {
  Badge,
  Box,
  Flex,
  Heading,
  Stack,
  Text,
  Link,
  Card,
  CardBody,
  useDisclosure,
} from '@chakra-ui/react';
import { BsChevronLeft } from 'react-icons/bs';
import DeleteConfirmation from '../components/DeleteConfrimation';
import SingleTaskSkeleton from '../_skeletons/SingleTaskSkeleton';
import toast from 'react-hot-toast'; // ✅ FIXED

export default function SingleTask() {
  const [task, setTask] = useState(null);
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // ✅ FETCH TASK
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
          credentials: 'include',
        });

        if (!res.ok) {
          const err = await res.json();
          toast.error(err.message || 'Failed to fetch task');
          return;
        }

        const data = await res.json();
        setTask(data);
      } catch (error) {
        toast.error('Something went wrong');
        console.log(error);
      }
    };

    if (taskId) fetchTask();
  }, [taskId]);

  // ✅ DELETE TASK
  const handleDeleteTask = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Task deleted');
        navigate('/tasks');
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
      console.log(error);
    }
  };

  // ✅ LOADING STATE
  if (!task) {
    return <SingleTaskSkeleton />;
  }

  return (
    <Box p="3" maxW="lg" mx="auto">
      {/* BACK BUTTON */}
      <Link
        as={RouterLink}
        to="/tasks"
        color="teal"
        _hover={{ textDecor: 'none' }}
        display="flex"
        alignItems="center"
      >
        <BsChevronLeft /> All Tasks
      </Link>

      {/* TITLE */}
      <Heading fontSize="3xl" fontWeight="semibold" textAlign="center" my="7">
        {task.name}
      </Heading>

      {/* STATUS + DATE */}
      <Stack direction="row" align="center">
        <Badge
          fontSize="md"
          colorScheme={task.status === 'open' ? 'orange' : 'green'}
        >
          {task.status}
        </Badge>

        {task.due && (
          <Text>{new Date(task.due).toLocaleDateString()}</Text>
        )}
      </Stack>

      {/* DESCRIPTION */}
      <Card mt="4" border="1px solid" borderColor="gray.200">
        <CardBody>
          <Text>{task.description}</Text>
        </CardBody>
      </Card>

      {/* ACTIONS */}
      <Flex justify="space-between" mt="5">
        <Text
          as="span"
          color="red.600"
          cursor="pointer"
          onClick={onOpen}
        >
          Delete Task
        </Text>

        <Link
          as={RouterLink}
          to={`/update-task/${task._id}`}
          color="teal"
          _hover={{ textDecor: 'none' }}
        >
          Edit Task
        </Link>
      </Flex>

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmation
        alertTitle="Delete Task"
        handleClick={handleDeleteTask}
        isOpen={isOpen}
        onClose={onClose}
      />
    </Box>
  );
}