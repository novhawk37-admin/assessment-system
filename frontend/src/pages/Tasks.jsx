import React, { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Circle,
  Trash2,
  UploadCloud
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from '../components/DashboardLayout'
import Topbar from '../components/Topbar'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { mockTasks } from '../mockData'

const statusStyles = {
  assigned: 'bg-gray-100 text-ink-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}

export default function Tasks() {
  const { user, offline } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [usingMock, setUsingMock] = useState(offline)
  const [selectedTask, setSelectedTask] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [githubLink, setGithubLink] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  function load() {
    if (offline) {
      setTasks(mockTasks)
      setLoading(false)
      return
    }
    setLoading(true)
    client
      .get('/api/tasks')
      .then((res) => setTasks(res.data))
      .catch((err) => {
        if (!err.response) {
          setUsingMock(true)
          setTasks(mockTasks)
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offline])

  async function submitTask() {
    const formData = new FormData();
    formData.append("github_link", githubLink);

    if (file) {
      formData.append("file", file);
    }

    try {
      setUploading(true);

      await client.post(
        `/api/tasks/${selectedTask.id}/submit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (e) => {
            const percent = Math.round(
              (e.loaded * 100) / e.total
            );
            setProgress(percent);
          },
        }
      );

      setUploading(false);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setOpenDialog(false);
        load();
      }, 1800);

    } catch (err) {
      setUploading(false);

      console.error(err);
      console.log(err.response);
      console.log(err.response?.data);

      alert(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message
      );
    }
  }

  async function toggleComplete(task) {
    if (usingMock) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: t.status === 'completed' ? 'assigned' : 'completed' } : t,
        ),
      )
      return
    }
    const nextStatus = task.status === 'completed' ? 'assigned' : 'completed'
    await client.put(`/api/tasks/${task.id}`, { status: nextStatus })
    load()
  }

  async function removeTask(id) {
    if (!confirm('Delete this task?')) return
    if (usingMock) {
      setTasks((prev) => prev.filter((t) => t.id !== id))
      return
    }
    await client.delete(`/api/tasks/${id}`)
    load()
  }

  return (
    <DashboardLayout>
      <Topbar title={isAdmin ? 'All Tasks' : 'My Tasks'}
        subtitle="Track and manage tasks in one place."
        showBack
      />

      {usingMock && (
        <div className="mb-5 px-4 py-2.5 rounded-xl bg-orange-50 text-accent-orange text-sm font-medium">
          Showing static demo data — backend isn't connected.
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-ink-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Task</th>
              <th className="text-left px-5 py-3 font-semibold">Description</th>
              <th className="text-left px-5 py-3 font-semibold">Category</th>
              {isAdmin && <th className="text-left px-5 py-3 font-semibold">Assignee</th>}
              <th className="text-left px-5 py-3 font-semibold">Due Date</th>
              <th className="text-left px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {!loading && tasks.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-ink-500">
                  No tasks yet.
                </td>
              </tr>
            )}
            {tasks.map((t) => (
              <tr key={t.id} className="border-t border-gray-100">
                <td className="px-5 py-3">
                  <button
                    onClick={() => {
                      if (isAdmin) {
                        toggleComplete(t);
                      } else {
                        setSelectedTask(t);
                        setGithubLink(t.github_link || "");
                        setOpenDialog(true);
                      }
                    }}
                    className="flex items-center gap-2 text-left"
                  >
                    {t.status === 'completed' ? (
                      <CheckCircle2 size={18} className="text-accent-green" />
                    ) : (
                      <Circle size={18} className="text-ink-500" />
                    )}
                    <span className={t.status === 'completed' ? 'line-through text-ink-500' : 'text-ink-900 font-medium'}>
                      {t.title}
                    </span>
                  </button>
                </td>
                <td className="px-5 py-3 text-ink-700">{t.description || '-'}</td>
                <td className="px-5 py-3 text-ink-700">{t.category || '-'}</td>
                {isAdmin && <td className="px-5 py-3 text-ink-700">{t.assignee_name || '-'}</td>}
                <td className="px-5 py-3 text-ink-700">
                  {t.due_date ? new Date(t.due_date).toLocaleDateString() : '-'}
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[t.status]}`}>
                    {t.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {t.upload_image ? (
                    <img
                      src={t.upload_image}
                      alt="submission"
                      className="w-24 h-24 rounded-lg object-cover border"
                    />
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  {isAdmin && (
                    <button onClick={() => removeTask(t.id)} className="text-ink-500 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {openDialog && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">

              <h2 className="text-xl font-semibold mb-4">
                Submit Task
              </h2>

              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Task
                  </label>

                  <input
                    value={selectedTask?.title || ""}
                    disabled
                    className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    GitHub Repository Link
                  </label>

                  <input
                    type="url"
                    placeholder="https://github.com/username/project"
                    value={githubLink}
                    onChange={(e) => setGithubLink(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div className="space-y-3">

                  <label className="block text-sm font-semibold">
                    Upload Project
                  </label>

                  <motion.div
                    {...getRootProps()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition
      ${isDragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-500"
                      }`}
                  >
                    <input {...getInputProps()} />

                    <UploadCloud
                      size={55}
                      className="mx-auto text-blue-600 mb-4"
                    />

                    <h3 className="font-semibold text-lg">
                      Drag & Drop your project
                    </h3>

                    <p className="text-gray-500 mt-2">
                      or click to browse
                    </p>

                    {file && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-5 text-sm text-blue-600 font-medium"
                      >
                        📄 {file.name}
                      </motion.div>
                    )}
                  </motion.div>

                  <AnimatePresence>
                    {uploading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-4">
                          <motion.div
                            className="h-full bg-blue-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                          />
                        </div>

                        <p className="text-center mt-2 text-sm">
                          Uploading... {progress}%
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {success && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex justify-center mt-5"
                      >
                        <CheckCircle2
                          size={70}
                          className="text-green-500"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

              </div>

              <div className="flex justify-end gap-3 mt-6">

                <button
                  onClick={() => setOpenDialog(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={submitTask}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit
                </button>

              </div>

            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
