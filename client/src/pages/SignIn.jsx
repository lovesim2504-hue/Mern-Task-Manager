import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../util.js';
import { useUser } from '../context/UserContext.jsx';
import { useState } from 'react';

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

export default function SignIn() {
  const navigate = useNavigate();
  const { updateUser } = useUser();

  const [showUpgrade, setShowUpgrade] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

  // ✅ LOGIN FUNCTION
  const doSubmit = async values => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Sign In Successful');

        localStorage.removeItem("userEmail");

        updateUser(data);
        navigate('/profile');
      } else {
        if (res.status === 403) {
          setShowUpgrade(true);

          // ✅ Save email for success page
          localStorage.setItem("userEmail", values.email);
        }

        toast.error(data.message || "Login failed");
      }

    } catch (error) {
      console.log(error);
      toast.error('Something went wrong');
    }
  };

  // ✅ STRIPE PAYMENT FUNCTION
  const handlePayment = async () => {
    try {
      setLoadingPayment(true);

      const res = await fetch(
        `${API_BASE_URL}/payment/create-checkout-session`,
        { method: "POST" }
      );

      const data = await res.json();

      console.log("Stripe URL:", data.url);

      if (!data.url) {
        toast.error("Payment failed ❌");
        setLoadingPayment(false);
        return;
      }

      // ✅ Redirect to Stripe
      window.location.href = data.url;

    } catch (error) {
      console.log(error);
      toast.error("Payment error ❌");
      setLoadingPayment(false);
    }
  };

  return (
    <Box p='3' maxW='lg' mx='auto'>
      <Heading textAlign='center' fontSize='3xl' my='7'>
        Enter Your Credentials
      </Heading>

      <form onSubmit={handleSubmit(doSubmit)}>
        <Stack gap='4'>

          <FormControl isInvalid={errors.email}>
            <Input
              type='email'
              placeholder='Email'
              {...register('email', { required: 'Email is required' })}
            />
            <FormErrorMessage>
              {errors.email?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.password}>
            <Input
              type='password'
              placeholder='Password'
              {...register('password', { required: 'Password is required' })}
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
            Sign In
          </Button>

        </Stack>
      </form>

      {/* 🔥 UPGRADE SECTION */}
      {showUpgrade && (
        <Box mt="6" textAlign="center">
          <Text color="red.500" mb="3">
            Your free trial has expired 🚫
          </Text>

          <Button
            colorScheme="yellow"
            onClick={handlePayment}
            isLoading={loadingPayment}
          >
            Upgrade to Premium 💳
          </Button>
        </Box>
      )}

      <Flex gap='2' mt='5'>
        <Text>Dont have an account?</Text>
        <Link to={'/signup'}>
          <Text as='span' color='blue.400'>
            Sign up
          </Text>
        </Link>
      </Flex>
    </Box>
  );
}