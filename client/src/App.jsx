import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { Toaster } from 'react-hot-toast';

import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import CreateTask from './pages/CreateTask';
import UpdateTask from './pages/UpdateTask';
import Tasks from './pages/Tasks';
import SingleTask from './pages/SingleTask';
import Verify from './pages/Verify';
import Success from './pages/Success'; // ✅ ADD THIS

import { UserProvider } from './context/UserContext';
import PrivateRoute from './components/PrivateRoute';
import NavBar from './components/NavBar';

export default function App() {
  return (
    <UserProvider>
      <ChakraProvider>
        <BrowserRouter>
          <NavBar />
          <Toaster position="bottom-right" />

          <Routes>
            {/* 🌐 Public Routes */}
            <Route path='/' element={<Home />} />
            <Route path='/signin' element={<SignIn />} />
            <Route path='/signup' element={<SignUp />} />
            <Route path='/verify/:token' element={<Verify />} />

            {/* 💳 Stripe Routes (MUST be public) */}
            <Route path='/success' element={<Success />} />
            <Route
              path='/cancel'
              element={
                <h1 style={{ textAlign: 'center', marginTop: '100px' }}>
                  Payment Cancelled ❌
                </h1>
              }
            />

            {/* 🔒 Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path='/profile' element={<Profile />} />
              <Route path='/create-task' element={<CreateTask />} />
              <Route path='/update-task/:taskId' element={<UpdateTask />} />
              <Route path='/tasks' element={<Tasks />} />
              <Route path='/tasks/:taskId' element={<SingleTask />} />
            </Route>
          </Routes>

        </BrowserRouter>
      </ChakraProvider>
    </UserProvider>
  );
}