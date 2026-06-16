import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';
import { API_BASE_URL } from '../util.js';
import toast from 'react-hot-toast';
import {
  Box,
  Heading,
  Input,
  Stack,
  FormControl,
  Button,
  Link,
  Flex,
  Text,
  FormErrorMessage,
  useDisclosure,
} from '@chakra-ui/react';
import DeleteConfirmation from '../components/DeleteConfrimation.jsx';
import { AvatarUploader } from '../components/AvatarUploader.jsx';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // ✅ FIXED
  const [files, setFiles] = useState([]);

  const {
    register,
    handleSubmit,
    resetField,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      avatar: user?.avatar || '',
      username: user?.username || '',
      email: user?.email || '',
    },
  });

  // ✅ Upload image
  const handleFileUpload = async files => {
    const formData = new FormData();
    formData.append('image', files[0]);

    try {
      const res = await fetch(`${API_BASE_URL}/image/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const response = await res.json();
      return response.imageUrl;
    } catch (error) {
      console.log(error);
      throw error; // ✅ FIXED
    }
  };

  // ✅ Submit form
  const doSubmit = async values => {
    try {
      // upload new avatar if selected
      if (files && files.length > 0) {
        const newUrl = await handleFileUpload(files);
        if (newUrl) values.avatar = newUrl;
      }

      const res = await fetch(`${API_BASE_URL}/users/update/${user._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (res.status === 200) {
        resetField('password');
        updateUser(data);
        toast.success('Profile Updated');

        // ✅ FIXED (redirect added)
        navigate('/tasks');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Profile Update Error');
    }
  };

  // ✅ Delete user
  const handleDeleteUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/delete/${user._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();

      if (res.status === 200) {
        toast.success(data.message);
        updateUser(null);
        navigate('/');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Delete Error');
    }
  };

  // ✅ Sign out
  const handleSignOut = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signout`, {
        credentials: 'include',
      });

      const data = await res.json();
      toast.success(data.message);

      updateUser(null);
      navigate('/');
    } catch (error) {
      toast.error('Sign out failed');
    }
  };

  return (
    <Box p='3' maxW='lg' mx='auto'>
      <DeleteConfirmation
        alertTitle='Delete Account'
        handleClick={handleDeleteUser}
        isOpen={isOpen}
        onClose={onClose}
      />

      <Heading textAlign='center' my='7'>
        Your Profile
      </Heading>

      <form onSubmit={handleSubmit(doSubmit)}>
        <Stack gap='4'>
          <Controller
            name='avatar'
            control={control}
            render={({ field }) => (
              <AvatarUploader
                onFieldChange={field.onChange}
                imageUrl={field.value}
                setFiles={setFiles}
              />
            )}
          />

          <FormControl isInvalid={errors.username}>
            <Input
              placeholder='username'
              {...register('username', { required: 'Username is required' })}
            />
            <FormErrorMessage>
              {errors.username?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.email}>
            <Input
              type='email'
              placeholder='email'
              {...register('email', { required: 'Email is required' })}
            />
            <FormErrorMessage>
              {errors.email?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.password}>
            <Input
              type='password'
              placeholder='New password'
              {...register('password')}
            />
            <FormErrorMessage>
              {errors.password?.message}
            </FormErrorMessage>
          </FormControl>

          <Button
            type='submit'
            isLoading={isSubmitting}
            colorScheme='teal'
          >
            Update Profile
          </Button>
        </Stack>
      </form>

      <Stack gap='4' mt='5'>
        <Link
          as={RouterLink}
          to='/create-task'
          bg='green.500'
          p='2'
          rounded='lg'
          textAlign='center'
          color='white'
        >
          Create New Task
        </Link>

        <Flex justify='space-between'>
          <Text color='red.600' cursor='pointer' onClick={onOpen}>
            Delete Account
          </Text>

          <Text color='red.600' cursor='pointer' onClick={handleSignOut}>
            Sign Out
          </Text>
        </Flex>

        <Text textAlign='center'>
          <Link as={RouterLink} to='/tasks' color='teal'>
            Show Tasks
          </Link>
        </Text>
      </Stack>
    </Box>
  );
}