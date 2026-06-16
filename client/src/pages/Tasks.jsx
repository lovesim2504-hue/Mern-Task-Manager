import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { API_BASE_URL } from '../util';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import TasksSkeleton from '../_skeletons/TaskSkeleton';
import Pagination from '../components/pagination';
import { BsArrowUp } from 'react-icons/bs';

export default function Tasks() {
  const { user } = useUser();
  const [tasks, setTasks] = useState(null);
  const [itemCount, setItemCount] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    if (!user?._id) return;

    const fetchTasks = async () => {
      try {
        const query = searchParams.toString()
          ? '?' + searchParams.toString()
          : '';

        const res = await fetch(
          `${API_BASE_URL}/tasks/user/${user._id}${query}`,
          { credentials: 'include' }
        );

        const data = await res.json();

        setTasks(data.tasks || []);
        setItemCount(data.taskCount || 0);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [searchParams, user]);

  const handleStatusFilter = e => {
    const value = e.target.value;
    const newParams = new URLSearchParams(searchParams);

    if (value) {
      newParams.set('status', value);
    } else {
      newParams.delete('status');
    }

    setSearchParams(newParams);
  };

  const handleOrderBy = value => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('orderBy', value);
    setSearchParams(newParams);
  };

  // ✅ Loading state
  if (!tasks) {
    return <TasksSkeleton />;
  }

  return (
    <Box p="5" maxW="4xl" mx="auto">
      <Heading
        as="h1"
        fontSize="3xl"
        fontWeight="semibold"
        textAlign="center"
        my="7"
      >
        Tasks to do
      </Heading>

      <Flex justify="space-between" mb="3">
        <Box w="120px">
          <Select placeholder="All" onChange={handleStatusFilter}>
            <option value="open">Open</option>
            <option value="done">Done</option>
          </Select>
        </Box>

        <Button
          as={Link}
          to="/create-task"
          colorScheme="green"
          textTransform="uppercase"
          fontWeight="semibold"
        >
          Create Task
        </Button>
      </Flex>

      <TableContainer>
        <Table border="2px solid" borderColor="gray.100">
          <Thead backgroundColor="gray.100">
            <Tr>
              <Th>
                <Flex
                  onClick={() => handleOrderBy('name')}
                  cursor="pointer"
                  alignItems="center"
                >
                  Task{' '}
                  {searchParams.get('orderBy') === 'name' && <BsArrowUp />}
                </Flex>
              </Th>

              <Th>
                <Flex
                  onClick={() => handleOrderBy('priority')}
                  cursor="pointer"
                  alignItems="center"
                >
                  Priority{' '}
                  {searchParams.get('orderBy') === 'priority' && (
                    <BsArrowUp />
                  )}
                </Flex>
              </Th>

              <Th>
                <Flex
                  onClick={() => handleOrderBy('status')}
                  cursor="pointer"
                  alignItems="center"
                >
                  Status{' '}
                  {searchParams.get('orderBy') === 'status' && <BsArrowUp />}
                </Flex>
              </Th>

              <Th>
                <Flex
                  onClick={() => handleOrderBy('due')}
                  cursor="pointer"
                  alignItems="center"
                >
                  Due Date{' '}
                  {searchParams.get('orderBy') === 'due' && <BsArrowUp />}
                </Flex>
              </Th>

              <Th>Assignment</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>

          <Tbody>
            {tasks.length === 0 ? (
              <Tr>
                <Td colSpan="6" textAlign="center">
                  No tasks found
                </Td>
              </Tr>
            ) : (
              tasks.map(task => (
                <Tr key={task._id}>
                  {/* Task Name */}
                  <Td>
                    <Link to={`/tasks/${task._id}`}>{task.name}</Link>
                  </Td>

                  {/* Priority */}
                  <Td>
                    <Badge
                      colorScheme={
                        task.priority === 'urgent' ? 'red' : 'gray'
                      }
                    >
                      {task.priority}
                    </Badge>
                  </Td>

                  {/* Status */}
                  <Td>
                    <Badge
                      colorScheme={
                        task.status === 'open' ? 'orange' : 'green'
                      }
                    >
                      {task.status}
                    </Badge>
                  </Td>

                  {/* Due Date */}
                  <Td>
                    {task.due
                      ? new Date(task.due).toDateString()
                      : '-'}
                  </Td>

                  {/* Assignment */}
                  <Td>
                    {task.assignment ? (
                      <Flex gap="2">
                        <a
                          href={task.assignment}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
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
                    ) : (
                      <Badge colorScheme="gray">No File</Badge>
                    )}
                  </Td>

                  {/* Actions */}
                  <Td>
                    <Button
                      as={Link}
                      to={`/update-task/${task._id}`}
                      size="sm"
                      colorScheme="yellow"
                    >
                      Edit
                    </Button>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>

      <Pagination
        itemCount={itemCount}
        pageSize={4}
        currentPage={page}
      />
    </Box>
  );
}