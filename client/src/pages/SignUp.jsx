import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
  FormControl,
  Input,
  Button,
  Text,
  Box,
  Flex,
  Heading,
  Stack,
  FormErrorMessage,
} from '@chakra-ui/react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../util.js';
import { useUser } from '../context/UserContext';

export default function SignUp() {
  const navigate = useNavigate();
  const { updateUser } = useUser();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

const doSubmit = async (values) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(values),
    });

    const data = await res.json();

    console.log("STATUS:", res.status);
    console.log("DATA:", data);

    if (res.ok) {
      // ✅ Show verify message
      toast.success('Signup successful 🎉 Please verify your email 📧');

      // ❌ REMOVE THIS (very important)
      // updateUser(data.user);

      // ✅ Redirect to signin with message
      navigate('/signin', {
        state: {
          message: 'Please verify your email before login 📧',
        },
      });

    } else {
      toast.error(data?.message || 'Signup failed');
    }

  } catch (error) {
    console.error(error);
    toast.error('Something went wrong');
  }
};

  return (
    <Box p='3' maxW='lg' mx='auto'>
      <Heading
        textAlign='center'
        fontSize='3xl'
        fontWeight='semibold'
        my='7'
      >
        Create an Account
      </Heading>

      <form onSubmit={handleSubmit(doSubmit)}>
        <Stack gap='4'>

          {/* Username */}
          <FormControl isInvalid={errors.username}>
            <Input
              placeholder='Username'
              {...register('username', {
                required: 'Username is required',
              })}
            />
            <FormErrorMessage>
              {errors.username?.message}
            </FormErrorMessage>
          </FormControl>

          {/* Email */}
          <FormControl isInvalid={errors.email}>
            <Input
              type='email'
              placeholder='Email'
              {...register('email', {
                required: 'Email is required',
              })}
            />
            <FormErrorMessage>
              {errors.email?.message}
            </FormErrorMessage>
          </FormControl>

          {/* Password */}
          <FormControl isInvalid={errors.password}>
            <Input
              type='password'
              placeholder='Password'
              {...register('password', {
                required: 'Password is required',
              })}
            />
            <FormErrorMessage>
              {errors.password?.message}
            </FormErrorMessage>
          </FormControl>

          {/* Submit Button */}
          <Button
            type='submit'
            isLoading={isSubmitting}
            colorScheme='teal'
            textTransform='uppercase'
          >
            Sign Up
          </Button>
        </Stack>
      </form>

      {/* Sign In Link */}
      <Flex gap='2' mt='5'>
        <Text>Already have an account?</Text>
        <Link to='/signin'>
          <Text color='blue.400'>Sign in</Text>
        </Link>
      </Flex>
    </Box>
  );
}