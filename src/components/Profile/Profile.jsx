import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectTheme } from '../../redux/features/themeSlice';
import profilePic from '../../assets/images/testimonials/me.jpg';

function ProfilePage() {
  const theme = useSelector(selectTheme);
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState({
    name: 'Bashar',
    email: 'Skalamboo@example.com',
    bio: 'Frontend Developer passionate about UI/UX design.',
  });

  const handleChange = (e) => {
    setUser(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleEdit = () => setEditMode(!editMode);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 mt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-4xl rounded-2xl p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-xl'}`}
      >
        <div className="flex flex-col items-center col-span-1">
          <img
            src={profilePic}
            alt="Profile"
            className="w-40 h-40 object-cover rounded-full ring-4 ring-primary/30 mb-4"
          />
          <button
            onClick={toggleEdit}
            className="mt-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition"
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="col-span-2">
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Profile</h2>
          <form className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
              <input
                name="name"
                value={user.name}
                onChange={handleChange}
                disabled={!editMode}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
              <input
                name="email"
                type="email"
                value={user.email}
                onChange={handleChange}
                disabled={!editMode}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Bio</label>
              <textarea
                name="bio"
                value={user.bio}
                onChange={handleChange}
                disabled={!editMode}
                rows={4}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              />
            </div>

            {editMode && (
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200"
              >
                Save Changes
              </button>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default ProfilePage;
