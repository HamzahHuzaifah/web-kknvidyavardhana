import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  Shield,
  UserCheck, 
  UserX, 
  Users, 
  UserPlus,
  UserMinus,
  Key,
  Lock,
  Search,
  UploadCloud, 
  RefreshCw,
  Compass,
  PlusCircle,
  Pencil,
  Trash2,
  Save,
  X,
  Video,
  Share2,
  Play,
  Sparkles,
  BookOpen,
  FileText,
  Download
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ConfirmModal from '../components/ConfirmModal';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'users' | 'profile' | 'media' | 'articles'
  
  // Custom Pop-up / Confirm Dialog State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: 'Konfirmasi Tindakan',
    message: '',
    confirmText: 'Ya, Lanjutkan',
    cancelText: 'Batal',
    showCancel: true,
    type: 'danger',
    onConfirm: null,
    isLoading: false
  });

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const showAlert = (message, title = 'Perhatian') => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText: 'Mengerti',
      cancelText: 'Tutup',
      showCancel: false,
      type: 'warning',
      onConfirm: () => closeConfirmModal(),
      isLoading: false
    });
  };

  // Attendance state
  const [attendanceList, setAttendanceList] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [clockInStatus, setClockInStatus] = useState({ type: '', message: '' });
  const [isClockingIn, setIsClockingIn] = useState(false);

  // User management state
  const [userList, setUserList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [adminActionMsg, setAdminActionMsg] = useState({ type: '', message: '' });
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  // Add User Modal state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ username: '', password: '', role: 'user' });
  const [savingNewUser, setSavingNewUser] = useState(false);

  // Reset Password Modal state
  const [resetPasswordModalUser, setResetPasswordModalUser] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [savingResetPassword, setSavingResetPassword] = useState(false);

  // Profile & Team state
  const [profileForm, setProfileForm] = useState({
    about_title: '',
    about_description: '',
    vision: '',
    mission: '',
    village_name: '',
    village_description: '',
    village_population: '',
    village_rtrw: '',
    village_area: '',
    village_latitude: '',
    village_longitude: '',
    village_map_label: ''
  });
  const [teamList, setTeamList] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileSaveMsg, setProfileSaveMsg] = useState({ type: '', message: '' });

  // Team member form state
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [memberForm, setMemberForm] = useState({
    name: '',
    role: '',
    major: '',
    display_order: 0
  });
  const [memberImage, setMemberImage] = useState(null);
  const [teamActionMsg, setTeamActionMsg] = useState({ type: '', message: '' });
  const [savingMember, setSavingMember] = useState(false);

  // Media & Social state
  const [mediaList, setMediaList] = useState([]);
  const [socialLinksList, setSocialLinksList] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [editingMediaId, setEditingMediaId] = useState(null);
  const [mediaForm, setMediaForm] = useState({
    title: '',
    platform: 'youtube',
    url: '',
    caption: '',
    is_autoplay: 1,
    display_order: 0
  });
  const [socialForm, setSocialForm] = useState({
    platform: 'instagram',
    username_handle: '',
    url: ''
  });
  const [mediaActionMsg, setMediaActionMsg] = useState({ type: '', message: '' });
  const [socialActionMsg, setSocialActionMsg] = useState({ type: '', message: '' });
  const [savingMedia, setSavingMedia] = useState(false);

  // Articles & Publications state (Admin edit & delete)
  const [articlesList, setArticlesList] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [articleCategoryFilter, setArticleCategoryFilter] = useState('all');
  const [articleActionMsg, setArticleActionMsg] = useState({ type: '', message: '' });
  const [editingArticle, setEditingArticle] = useState(null);
  const [editArticleForm, setEditArticleForm] = useState({
    title: '',
    category: 'berita',
    content: ''
  });
  const [editArticleImage, setEditArticleImage] = useState(null);
  const [editArticleDoc, setEditArticleDoc] = useState(null);
  const [savingArticle, setSavingArticle] = useState(false);

  const username = localStorage.getItem('username') || 'Pengguna';
  const role = localStorage.getItem('role') || 'user';
  const isAdmin = role === 'admin';

  // Fetch Attendance
  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/attendance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendanceList(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserList(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch Profile & Team
  const fetchProfileAndTeam = async () => {
    if (!isAdmin) return;
    setLoadingProfile(true);
    try {
      const [profileRes, teamRes] = await Promise.all([
        axios.get('http://localhost:5000/api/profile-info'),
        axios.get('http://localhost:5000/api/team')
      ]);

      if (profileRes.data) {
        setProfileForm({
          about_title: profileRes.data.about_title || '',
          about_description: profileRes.data.about_description || '',
          vision: profileRes.data.vision || '',
          mission: profileRes.data.mission || '',
          village_name: profileRes.data.village_name || '',
          village_description: profileRes.data.village_description || '',
          village_population: profileRes.data.village_population || '',
          village_rtrw: profileRes.data.village_rtrw || '',
          village_area: profileRes.data.village_area || '',
          village_latitude: profileRes.data.village_latitude || '',
          village_longitude: profileRes.data.village_longitude || '',
          village_map_label: profileRes.data.village_map_label || ''
        });
      }
      setTeamList(teamRes.data || []);
    } catch (error) {
      console.error('Error fetching profile & team:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Fetch Media & Social Links
  const fetchMediaAndSocial = async () => {
    if (!isAdmin) return;
    setLoadingMedia(true);
    try {
      const [mediaRes, socialRes] = await Promise.all([
        axios.get('http://localhost:5000/api/media'),
        axios.get('http://localhost:5000/api/social-links')
      ]);
      setMediaList(mediaRes.data || []);
      setSocialLinksList(socialRes.data || []);
    } catch (error) {
      console.error('Error fetching media and social:', error);
    } finally {
      setLoadingMedia(false);
    }
  };

  // Fetch Articles
  const fetchArticlesAdmin = async () => {
    setLoadingArticles(true);
    try {
      let url = 'http://localhost:5000/api/articles';
      if (articleCategoryFilter !== 'all') {
        url += `?category=${articleCategoryFilter}`;
      }
      const response = await axios.get(url);
      setArticlesList(response.data || []);
    } catch (error) {
      console.error('Error fetching articles for admin:', error);
    } finally {
      setLoadingArticles(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    if (isAdmin) {
      fetchUsers();
      fetchProfileAndTeam();
      fetchMediaAndSocial();
      fetchArticlesAdmin();
    }
  }, [isAdmin, articleCategoryFilter]);

  // Update User Status (ACC / Reject)
  const handleUpdateUserStatus = async (userId, targetStatus) => {
    setAdminActionMsg({ type: '', message: '' });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/status`,
        { status: targetStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminActionMsg({ type: 'success', message: response.data.message });
      fetchUsers();
    } catch (error) {
      setAdminActionMsg({ 
        type: 'error', 
        message: error.response?.data?.error || 'Gagal mengubah status akun.' 
      });
    }
  };

  // Update User Role (Promote to Admin / Demote to User)
  const handleUpdateUserRole = (userId, targetRole, targetUsername) => {
    const isPromote = targetRole === 'admin';
    setConfirmModal({
      isOpen: true,
      title: isPromote ? 'Jadikan Administrator' : 'Turunkan ke User',
      message: isPromote 
        ? `Apakah Anda yakin ingin MEMBERIKAN HAK AKSES ADMIN kepada akun '${targetUsername}'? Pengguna ini akan memiliki wewenang penuh mengelola konten dan pengguna website.`
        : `Apakah Anda yakin ingin MENURUNKAN role akun '${targetUsername}' menjadi User (Anggota biasa)?`,
      confirmText: isPromote ? 'Ya, Berikan Akses Admin' : 'Ya, Turunkan Role',
      cancelText: 'Batal',
      showCancel: true,
      type: isPromote ? 'warning' : 'info',
      onConfirm: async () => {
        closeConfirmModal();
        setAdminActionMsg({ type: '', message: '' });
        try {
          const token = localStorage.getItem('token');
          const response = await axios.patch(
            `http://localhost:5000/api/admin/users/${userId}/role`,
            { role: targetRole },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setAdminActionMsg({ type: 'success', message: response.data.message });
          fetchUsers();
        } catch (error) {
          setAdminActionMsg({
            type: 'error',
            message: error.response?.data?.error || 'Gagal mengubah role pengguna.'
          });
        }
      }
    });
  };

  // Delete User
  const handleDeleteUser = (userId, targetUsername) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Akun Pengguna',
      message: `PERINGATAN: Apakah Anda yakin ingin MENGHAPUS akun '${targetUsername}' secara permanen?\n\nSeluruh riwayat presensi yang terkait akun ini juga akan terhapus. Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus Akun',
      cancelText: 'Batal',
      showCancel: true,
      type: 'danger',
      onConfirm: async () => {
        closeConfirmModal();
        setAdminActionMsg({ type: '', message: '' });
        try {
          const token = localStorage.getItem('token');
          const response = await axios.delete(
            `http://localhost:5000/api/admin/users/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setAdminActionMsg({ type: 'success', message: response.data.message });
          fetchUsers();
        } catch (error) {
          setAdminActionMsg({
            type: 'error',
            message: error.response?.data?.error || 'Gagal menghapus akun pengguna.'
          });
        }
      }
    });
  };

  // Submit Reset Password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetPasswordModalUser) return;
    if (newPasswordInput.length < 6) {
      showAlert('Password baru minimal 6 karakter!', 'Validasi Password');
      return;
    }

    setSavingResetPassword(true);
    setAdminActionMsg({ type: '', message: '' });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:5000/api/admin/users/${resetPasswordModalUser.id}/reset-password`,
        { newPassword: newPasswordInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminActionMsg({ type: 'success', message: response.data.message });
      setResetPasswordModalUser(null);
      setNewPasswordInput('');
      fetchUsers();
    } catch (error) {
      setAdminActionMsg({
        type: 'error',
        message: error.response?.data?.error || 'Gagal mereset password pengguna.'
      });
    } finally {
      setSavingResetPassword(false);
    }
  };

  // Submit Create User directly by Admin
  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (newUserForm.username.trim().length < 3) {
      showAlert('Username minimal 3 karakter!', 'Validasi Formulir');
      return;
    }
    if (newUserForm.password.length < 6) {
      showAlert('Password minimal 6 karakter!', 'Validasi Formulir');
      return;
    }

    setSavingNewUser(true);
    setAdminActionMsg({ type: '', message: '' });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/admin/users',
        newUserForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminActionMsg({ type: 'success', message: response.data.message });
      setShowAddUserModal(false);
      setNewUserForm({ username: '', password: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      setAdminActionMsg({
        type: 'error',
        message: error.response?.data?.error || 'Gagal menambahkan akun baru.'
      });
    } finally {
      setSavingNewUser(false);
    }
  };

  // Clock In
  const handleClockIn = () => {
    setIsClockingIn(true);
    setClockInStatus({ type: '', message: '' });

    if (!navigator.geolocation) {
      setClockInStatus({ type: 'error', message: 'Geolocation tidak didukung browser.' });
      setIsClockingIn(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const token = localStorage.getItem('token');
          await axios.post(
            'http://localhost:5000/api/attendance',
            { latitude, longitude },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setClockInStatus({ type: 'success', message: 'Presensi berhasil dicatat!' });
          fetchAttendance();
        } catch (error) {
          setClockInStatus({ type: 'error', message: 'Gagal mencatat presensi.' });
        } finally {
          setIsClockingIn(false);
        }
      },
      (error) => {
        setClockInStatus({ type: 'error', message: `Gagal mendapatkan lokasi: ${error.message}` });
        setIsClockingIn(false);
      }
    );
  };

  // Profile Save
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({ ...profileForm, [name]: value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaveMsg({ type: '', message: '' });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:5000/api/profile-info', profileForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileSaveMsg({ type: 'success', message: response.data.message });
    } catch (error) {
      setProfileSaveMsg({
        type: 'error',
        message: error.response?.data?.error || 'Gagal menyimpan profil.'
      });
    }
  };

  // Team Member Handlers
  const handleMemberFormChange = (e) => {
    const { name, value } = e.target;
    setMemberForm({ ...memberForm, [name]: value });
  };

  const handleMemberImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setMemberImage(e.target.files[0]);
    }
  };

  const handleStartEditMember = (member) => {
    setEditingMemberId(member.id);
    setMemberForm({
      name: member.name,
      role: member.role,
      major: member.major || '',
      display_order: member.display_order || 0
    });
    setMemberImage(null);
    setTeamActionMsg({ type: '', message: '' });
  };

  const handleCancelEditMember = () => {
    setEditingMemberId(null);
    setMemberForm({ name: '', role: '', major: '', display_order: 0 });
    setMemberImage(null);
    setTeamActionMsg({ type: '', message: '' });
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    setSavingMember(true);
    setTeamActionMsg({ type: '', message: '' });

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', memberForm.name);
      formData.append('role', memberForm.role);
      formData.append('major', memberForm.major);
      formData.append('display_order', memberForm.display_order);
      if (memberImage) {
        formData.append('image', memberImage);
      }

      if (editingMemberId) {
        await axios.put(`http://localhost:5000/api/team/${editingMemberId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setTeamActionMsg({ type: 'success', message: 'Data anggota tim berhasil diperbarui!' });
      } else {
        await axios.post('http://localhost:5000/api/team', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setTeamActionMsg({ type: 'success', message: 'Anggota tim baru berhasil ditambahkan!' });
      }

      handleCancelEditMember();
      fetchProfileAndTeam();
    } catch (error) {
      setTeamActionMsg({
        type: 'error',
        message: error.response?.data?.error || 'Gagal menyimpan anggota tim.'
      });
    } finally {
      setSavingMember(false);
    }
  };

  const handleDeleteMember = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Anggota Tim',
      message: 'Apakah Anda yakin ingin menghapus data anggota ini dari daftar susunan pengurus?',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      showCancel: true,
      type: 'danger',
      onConfirm: async () => {
        closeConfirmModal();
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:5000/api/team/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setTeamActionMsg({ type: 'success', message: 'Anggota tim berhasil dihapus.' });
          fetchProfileAndTeam();
        } catch (error) {
          setTeamActionMsg({
            type: 'error',
            message: error.response?.data?.error || 'Gagal menghapus anggota tim.'
          });
        }
      }
    });
  };

  // Media Handlers
  const handleMediaFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMediaForm({
      ...mediaForm,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    });
  };

  const handleStartEditMedia = (item) => {
    setEditingMediaId(item.id);
    setMediaForm({
      title: item.title,
      platform: item.platform,
      url: item.url,
      caption: item.caption || '',
      is_autoplay: item.is_autoplay,
      display_order: item.display_order || 0
    });
    setMediaActionMsg({ type: '', message: '' });
  };

  const handleCancelEditMedia = () => {
    setEditingMediaId(null);
    setMediaForm({
      title: '',
      platform: 'youtube',
      url: '',
      caption: '',
      is_autoplay: 1,
      display_order: 0
    });
    setMediaActionMsg({ type: '', message: '' });
  };

  const handleSaveMedia = async (e) => {
    e.preventDefault();
    setSavingMedia(true);
    setMediaActionMsg({ type: '', message: '' });

    try {
      const token = localStorage.getItem('token');
      if (editingMediaId) {
        await axios.put(`http://localhost:5000/api/media/${editingMediaId}`, mediaForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMediaActionMsg({ type: 'success', message: 'Konten media berhasil diperbarui!' });
      } else {
        await axios.post('http://localhost:5000/api/media', mediaForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMediaActionMsg({ type: 'success', message: 'Konten media baru berhasil ditambahkan!' });
      }

      handleCancelEditMedia();
      fetchMediaAndSocial();
    } catch (error) {
      setMediaActionMsg({
        type: 'error',
        message: error.response?.data?.error || 'Gagal menyimpan media.'
      });
    } finally {
      setSavingMedia(false);
    }
  };

  const handleDeleteMedia = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Konten Media',
      message: 'Apakah Anda yakin ingin menghapus video/media ini?',
      confirmText: 'Ya, Hapus Media',
      cancelText: 'Batal',
      showCancel: true,
      type: 'danger',
      onConfirm: async () => {
        closeConfirmModal();
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:5000/api/media/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMediaActionMsg({ type: 'success', message: 'Media berhasil dihapus.' });
          fetchMediaAndSocial();
        } catch (error) {
          setMediaActionMsg({
            type: 'error',
            message: error.response?.data?.error || 'Gagal menghapus media.'
          });
        }
      }
    });
  };

  const handleSaveSocialLink = async (e) => {
    e.preventDefault();
    setSocialActionMsg({ type: '', message: '' });

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/social-links', socialForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSocialActionMsg({ type: 'success', message: 'Akun media sosial berhasil ditambahkan!' });
      setSocialForm({ platform: 'instagram', username_handle: '', url: '' });
      fetchMediaAndSocial();
    } catch (error) {
      setSocialActionMsg({
        type: 'error',
        message: error.response?.data?.error || 'Gagal menambahkan akun media sosial.'
      });
    }
  };

  const handleDeleteSocialLink = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Akun Medsos',
      message: 'Apakah Anda yakin ingin menghapus akun media sosial ini dari daftar profil?',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      showCancel: true,
      type: 'danger',
      onConfirm: async () => {
        closeConfirmModal();
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:5000/api/social-links/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSocialActionMsg({ type: 'success', message: 'Akun medsos berhasil dihapus.' });
          fetchMediaAndSocial();
        } catch (error) {
          setSocialActionMsg({
            type: 'error',
            message: error.response?.data?.error || 'Gagal menghapus akun medsos.'
          });
        }
      }
    });
  };

  // Article Edit & Delete Handlers (Hanya Admin)
  const handleStartEditArticle = (article) => {
    setEditingArticle(article);
    setEditArticleForm({
      title: article.title,
      category: article.category || 'berita',
      content: article.content
    });
    setEditArticleImage(null);
    setEditArticleDoc(null);
    setArticleActionMsg({ type: '', message: '' });
  };

  const handleCancelEditArticle = () => {
    setEditingArticle(null);
    setEditArticleForm({ title: '', category: 'berita', content: '' });
    setEditArticleImage(null);
    setEditArticleDoc(null);
    setArticleActionMsg({ type: '', message: '' });
  };

  const handleSaveArticle = async (e) => {
    e.preventDefault();
    if (!editingArticle) return;
    setSavingArticle(true);
    setArticleActionMsg({ type: '', message: '' });

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', editArticleForm.title);
      formData.append('category', editArticleForm.category);
      formData.append('content', editArticleForm.content);
      if (editArticleImage) {
        formData.append('image', editArticleImage);
      }
      if (editArticleDoc) {
        formData.append('document', editArticleDoc);
      }

      await axios.put(`http://localhost:5000/api/articles/${editingArticle.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setArticleActionMsg({ type: 'success', message: 'Konten berhasil diperbarui oleh Admin!' });
      handleCancelEditArticle();
      fetchArticlesAdmin();
    } catch (error) {
      setArticleActionMsg({
        type: 'error',
        message: error.response?.data?.error || 'Gagal memperbarui konten.'
      });
    } finally {
      setSavingArticle(false);
    }
  };

  const handleDeleteArticle = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Konten Publikasi',
      message: 'Apakah Anda yakin ingin menghapus postingan/konten ini secara permanen? Data yang telah dihapus tidak dapat dipulihkan.',
      confirmText: 'Ya, Hapus Permanen',
      cancelText: 'Batal',
      showCancel: true,
      type: 'danger',
      onConfirm: async () => {
        closeConfirmModal();
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:5000/api/articles/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setArticleActionMsg({ type: 'success', message: 'Konten berhasil dihapus oleh Admin.' });
          fetchArticlesAdmin();
        } catch (error) {
          setArticleActionMsg({
            type: 'error',
            message: error.response?.data?.error || 'Gagal menghapus konten.'
          });
        }
      }
    });
  };

  const totalUsersCount = userList.length;
  const adminUsersCount = userList.filter(u => u.role === 'admin').length;
  const standardUsersCount = userList.filter(u => u.role === 'user').length;
  const pendingUsersCount = userList.filter(u => u.status === 'pending').length;

  const filteredUsers = userList.filter((usr) => {
    const matchesSearch = usr.username.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || usr.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'all' || usr.status === userStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Profile & Status Card */}
        <div className="bg-white border-2 border-primary-dark shadow-hard p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-yellow rounded-full mix-blend-multiply opacity-30 -mr-12 -mt-12 pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-primary-dark uppercase">
                Halo, {username}!
              </h1>
              <span className={`text-xs font-black px-2.5 py-1 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase ${
                isAdmin 
                  ? 'bg-gradient-yellow text-primary-dark' 
                  : 'bg-gradient-green text-white'
              }`}>
                Role: {isAdmin ? 'ADMINISTRATOR' : 'USER (ANGGOTA)'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              {isAdmin 
                ? 'Panel Pengelolaan: Presensi, ACC Akun, Profil, Medsos, serta Kelola Berita, Publikasi & Modul.' 
                : 'Hak Akses: Mempublikasikan Berita, Publikasi & Modul KKN serta presensi harian.'}
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 bg-gradient-yellow text-primary-dark font-bold px-4 py-2.5 border-2 border-primary-dark shadow-hard hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-xs tracking-wider"
            >
              <UploadCloud size={16} /> Upload Berita / Modul
            </Link>
          </div>
        </div>

        {/* NAVIGATION TABS FOR ADMIN */}
        {isAdmin && (
          <div className="flex flex-wrap gap-2 border-b-2 border-primary-dark pb-2">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3.5 py-2 font-black text-xs uppercase border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1.5 ${
                activeTab === 'attendance'
                  ? 'bg-gradient-blue text-white translate-y-0.5 shadow-none'
                  : 'bg-white text-primary-dark hover:bg-gray-100'
              }`}
            >
              <Clock size={15} /> Presensi & Riwayat
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-2 font-black text-xs uppercase border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'bg-gradient-blue text-white translate-y-0.5 shadow-none'
                  : 'bg-white text-primary-dark hover:bg-gray-100'
              }`}
            >
              <ShieldCheck size={15} /> ACC & Kelola User
              {pendingUsersCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse ml-0.5">
                  {pendingUsersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('articles')}
              className={`px-3.5 py-2 font-black text-xs uppercase border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1.5 ${
                activeTab === 'articles'
                  ? 'bg-gradient-blue text-white translate-y-0.5 shadow-none'
                  : 'bg-white text-primary-dark hover:bg-gray-100'
              }`}
            >
              <BookOpen size={15} /> Kelola Berita, Publikasi & Modul
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-2 font-black text-xs uppercase border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'bg-gradient-yellow text-primary-dark translate-y-0.5 shadow-none'
                  : 'bg-white text-primary-dark hover:bg-gray-100'
              }`}
            >
              <Compass size={15} /> Profil & Tim
            </button>

            <button
              onClick={() => setActiveTab('media')}
              className={`px-3.5 py-2 font-black text-xs uppercase border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1.5 ${
                activeTab === 'media'
                  ? 'bg-gradient-yellow text-primary-dark translate-y-0.5 shadow-none'
                  : 'bg-white text-primary-dark hover:bg-gray-100'
              }`}
            >
              <Video size={15} /> Media & Medsos
            </button>
          </div>
        )}

        {/* TAB 1: PRESENSI & RIWAYAT */}
        {(!isAdmin || activeTab === 'attendance') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 bg-white border-2 border-primary-dark shadow-hard p-6 relative overflow-hidden flex flex-col items-center justify-center text-center">
              <div className="absolute top-[-20%] left-[-20%] w-32 h-32 bg-gradient-yellow rounded-full mix-blend-multiply opacity-50 z-0 pointer-events-none"></div>
              
              <Clock size={44} className="text-primary-dark mb-4 relative z-10" />
              <h3 className="text-xl font-black text-primary-dark uppercase mb-2 relative z-10">Presensi Harian</h3>
              <p className="text-gray-600 mb-6 text-xs font-medium relative z-10">Catat kehadiran Anda beserta koordinat GPS lokasi KKN.</p>
              
              <button
                onClick={handleClockIn}
                disabled={isClockingIn}
                className="w-full bg-gradient-green text-white font-bold py-3 border-2 border-primary-dark shadow-hard hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-70 relative z-10 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
              >
                {isClockingIn ? 'Mencari Lokasi...' : <><MapPin size={16} /> Clock In (Presensi)</>}
              </button>

              {clockInStatus.message && (
                <div className={`mt-4 w-full p-3 border-2 text-xs font-bold shadow-hard relative z-10 flex items-start gap-2 ${
                  clockInStatus.type === 'success' 
                    ? 'bg-green-50 border-accent-dark text-accent-dark' 
                    : 'bg-red-50 border-red-600 text-red-600'
                }`}>
                  {clockInStatus.type === 'success' ? <CheckCircle size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
                  <span className="text-left">{clockInStatus.message}</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2 bg-white border-2 border-primary-dark shadow-hard p-6">
              <h3 className="text-xl font-black text-primary-dark uppercase mb-4 flex items-center gap-2">
                <Users size={20} /> Riwayat Presensi
              </h3>
              
              {loadingAttendance ? (
                <p className="text-xs font-bold text-gray-500">Memuat data presensi...</p>
              ) : attendanceList.length === 0 ? (
                <p className="text-xs font-medium text-gray-500 italic">Belum ada riwayat presensi yang tercatat.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gradient-blue text-white text-xs uppercase">
                        <th className="p-3 border-2 border-primary-dark">Waktu</th>
                        <th className="p-3 border-2 border-primary-dark">Anggota</th>
                        <th className="p-3 border-2 border-primary-dark">Koordinat (Lat, Lng)</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-medium">
                      {attendanceList.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="p-3 border-2 border-primary-dark">
                            {new Date(record.created_at).toLocaleString('id-ID')}
                          </td>
                          <td className="p-3 border-2 border-primary-dark uppercase font-bold text-primary-dark">
                            {record.username}
                          </td>
                          <td className="p-3 border-2 border-primary-dark text-gray-600">
                            {record.latitude}, {record.longitude}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PERSETUJUAN & PENGELOLAAN AKUN (ADMIN ONLY) */}
        {isAdmin && activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white border-2 border-primary-dark shadow-hard p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b-2 border-primary-dark pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-blue text-white border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <ShieldCheck size={26} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-primary-dark uppercase">
                      Pengelolaan Akun & Persetujuan (ACC User)
                    </h2>
                    <p className="text-xs text-gray-600 font-medium">
                      Verifikasi pendaftaran anggota, kelola hak akses Administrator / Anggota, reset password, dan kelola akun pengguna.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="p-2 border-2 border-primary-dark bg-gradient-yellow text-primary-dark font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase"
                  >
                    <UserPlus size={15} /> + Tambah Akun
                  </button>
                  <button
                    onClick={fetchUsers}
                    disabled={loadingUsers}
                    className="p-2 border-2 border-primary-dark bg-gray-100 hover:bg-gray-200 text-primary-dark font-bold text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <RefreshCw size={14} className={loadingUsers ? 'animate-spin' : ''} /> Segarkan
                  </button>
                </div>
              </div>

              {/* STATS CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-gray-50 border-2 border-primary-dark p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-primary-dark border border-primary-dark rounded">
                    <Users size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Total Akun</span>
                    <span className="text-lg font-black text-primary-dark">{totalUsersCount}</span>
                  </div>
                </div>

                <div className="bg-yellow-50 border-2 border-primary-dark p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
                  <div className="p-2 bg-yellow-200 text-yellow-900 border border-primary-dark rounded">
                    <Shield size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-yellow-900 uppercase block">Admin</span>
                    <span className="text-lg font-black text-yellow-900">{adminUsersCount}</span>
                  </div>
                </div>

                <div className="bg-green-50 border-2 border-primary-dark p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
                  <div className="p-2 bg-green-200 text-green-900 border border-primary-dark rounded">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-green-900 uppercase block">User (Anggota)</span>
                    <span className="text-lg font-black text-green-900">{standardUsersCount}</span>
                  </div>
                </div>

                <div className={`border-2 border-primary-dark p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 ${
                  pendingUsersCount > 0 ? 'bg-red-50 border-red-600' : 'bg-gray-50'
                }`}>
                  <div className={`p-2 border border-primary-dark rounded ${
                    pendingUsersCount > 0 ? 'bg-red-500 text-white animate-bounce' : 'bg-gray-200 text-gray-600'
                  }`}>
                    <Clock size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-600 uppercase block">Menunggu ACC</span>
                    <span className={`text-lg font-black ${pendingUsersCount > 0 ? 'text-red-600' : 'text-primary-dark'}`}>
                      {pendingUsersCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* SEARCH & FILTERS */}
              <div className="bg-gray-50 border-2 border-primary-dark p-3 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="Cari username..."
                    className="w-full pl-9 pr-3 py-1.5 border-2 border-primary-dark text-xs font-medium bg-white outline-none"
                  />
                  {userSearchTerm && (
                    <button
                      onClick={() => setUserSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black uppercase text-primary-dark">Role:</span>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="border-2 border-primary-dark px-2 py-1.5 text-xs font-bold bg-white outline-none"
                    >
                      <option value="all">Semua Role</option>
                      <option value="admin">Administrator</option>
                      <option value="user">User (Anggota)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black uppercase text-primary-dark">Status:</span>
                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                      className="border-2 border-primary-dark px-2 py-1.5 text-xs font-bold bg-white outline-none"
                    >
                      <option value="all">Semua Status</option>
                      <option value="approved">Disetujui (ACC)</option>
                      <option value="pending">Menunggu ACC</option>
                      <option value="rejected">Ditolak</option>
                    </select>
                  </div>
                </div>
              </div>

              {adminActionMsg.message && (
                <div className={`mb-4 p-3 border-2 text-xs font-bold shadow-hard flex items-center justify-between gap-2 ${
                  adminActionMsg.type === 'success' 
                    ? 'bg-green-50 border-accent-dark text-accent-dark' 
                    : 'bg-red-50 border-red-600 text-red-600'
                }`}>
                  <div className="flex items-center gap-2">
                    {adminActionMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span>{adminActionMsg.message}</span>
                  </div>
                  <button 
                    onClick={() => setAdminActionMsg({ type: '', message: '' })}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gradient-blue text-white text-xs uppercase">
                      <th className="p-3 border-2 border-primary-dark">Pengguna</th>
                      <th className="p-3 border-2 border-primary-dark">Hak Akses (Role)</th>
                      <th className="p-3 border-2 border-primary-dark">Waktu Daftar</th>
                      <th className="p-3 border-2 border-primary-dark">Status Akun</th>
                      <th className="p-3 border-2 border-primary-dark text-center">Tindakan Admin</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-gray-500 font-medium italic border-2 border-primary-dark bg-gray-50">
                          Tidak ada data akun yang cocok dengan pencarian atau filter.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((usr) => {
                        const isMainAdmin = usr.username === 'admin';
                        const isSelf = usr.username === username;

                        return (
                          <tr key={usr.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-3 border-2 border-primary-dark">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded flex items-center justify-center font-black text-xs border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                                  usr.role === 'admin' ? 'bg-yellow-300 text-primary-dark' : 'bg-blue-100 text-blue-900'
                                }`}>
                                  {usr.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-primary-dark flex items-center gap-1.5">
                                    <span>{usr.username}</span>
                                    {isSelf && (
                                      <span className="text-[10px] bg-gray-200 px-1.5 py-0.2 border border-gray-400 font-bold">
                                        Anda
                                      </span>
                                    )}
                                    {isMainAdmin && (
                                      <span className="text-[10px] bg-yellow-200 text-yellow-900 px-1.5 py-0.2 border border-yellow-700 font-black">
                                        Utama
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="p-3 border-2 border-primary-dark">
                              {usr.role === 'admin' ? (
                                <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-900 font-black px-2 py-0.5 border border-yellow-800 uppercase text-[10px]">
                                  <Shield size={11} /> Admin
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 font-black px-2 py-0.5 border border-blue-600 uppercase text-[10px]">
                                  <Users size={11} /> User (Anggota)
                                </span>
                              )}
                            </td>

                            <td className="p-3 border-2 border-primary-dark text-gray-600 font-medium">
                              {usr.created_at ? new Date(usr.created_at).toLocaleString('id-ID') : '-'}
                            </td>

                            <td className="p-3 border-2 border-primary-dark">
                              {usr.status === 'approved' && (
                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 font-black px-2 py-0.5 border border-green-800 uppercase text-[10px]">
                                  <CheckCircle size={10} /> Disetujui (ACC)
                                </span>
                              )}
                              {usr.status === 'pending' && (
                                <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-900 font-black px-2 py-0.5 border border-yellow-800 uppercase text-[10px] animate-pulse">
                                  <Clock size={10} /> Menunggu ACC
                                </span>
                              )}
                              {usr.status === 'rejected' && (
                                <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 font-black px-2 py-0.5 border border-red-800 uppercase text-[10px]">
                                  <AlertCircle size={10} /> Ditolak
                                </span>
                              )}
                            </td>

                            <td className="p-3 border-2 border-primary-dark">
                              <div className="flex flex-wrap items-center justify-center gap-1.5">
                                {/* ACC / TOLAK BUTTONS */}
                                {!isMainAdmin && usr.status !== 'approved' && (
                                  <button
                                    onClick={() => handleUpdateUserStatus(usr.id, 'approved')}
                                    className="inline-flex items-center gap-1 bg-gradient-green text-white font-bold px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-[10px]"
                                    title="Setujui pendaftaran akun"
                                  >
                                    <UserCheck size={12} /> ACC
                                  </button>
                                )}

                                {!isMainAdmin && !isSelf && usr.status !== 'rejected' && (
                                  <button
                                    onClick={() => handleUpdateUserStatus(usr.id, 'rejected')}
                                    className="inline-flex items-center gap-1 bg-red-600 text-white font-bold px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-[10px]"
                                    title="Tolak akun ini"
                                  >
                                    <UserX size={12} /> Tolak
                                  </button>
                                )}

                                {/* ROLE TOGGLE BUTTONS */}
                                {!isMainAdmin && !isSelf && (
                                  <>
                                    {usr.role === 'user' ? (
                                      <button
                                        onClick={() => handleUpdateUserRole(usr.id, 'admin', usr.username)}
                                        className="inline-flex items-center gap-1 bg-gradient-yellow text-primary-dark font-black px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-[10px]"
                                        title="Beri hak akses Administrator ke akun ini"
                                      >
                                        <Shield size={11} /> + Jadikan Admin
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleUpdateUserRole(usr.id, 'user', usr.username)}
                                        className="inline-flex items-center gap-1 bg-gray-200 text-primary-dark font-bold px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-[10px]"
                                        title="Turunkan hak akses ke User (Anggota)"
                                      >
                                        <UserMinus size={11} /> Jadikan User
                                      </button>
                                    )}
                                  </>
                                )}

                                {/* RESET PASSWORD BUTTON */}
                                {(!isMainAdmin || username === 'admin') && (
                                  <button
                                    onClick={() => {
                                      setResetPasswordModalUser(usr);
                                      setNewPasswordInput('');
                                    }}
                                    className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-primary-dark font-bold px-2 py-1 border border-primary-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all uppercase text-[10px]"
                                    title="Reset password pengguna"
                                  >
                                    <Key size={11} /> Sandi
                                  </button>
                                )}

                                {/* DELETE USER BUTTON */}
                                {!isMainAdmin && !isSelf && (
                                  <button
                                    onClick={() => handleDeleteUser(usr.id, usr.username)}
                                    className="inline-flex items-center p-1 bg-red-100 hover:bg-red-200 text-red-700 border border-red-700 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
                                    title="Hapus akun permanen"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}

                                {isMainAdmin && !isSelf && (
                                  <span className="text-[11px] text-gray-400 italic">Akun Sistem</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MODAL: TAMBAH PENGGUNA BARU */}
            {showAddUserModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white border-4 border-primary-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b-2 border-primary-dark pb-3">
                    <h3 className="text-lg font-black text-primary-dark uppercase flex items-center gap-2">
                      <UserPlus size={20} /> Tambah Akun Baru
                    </h3>
                    <button
                      onClick={() => setShowAddUserModal(false)}
                      className="p-1 text-gray-400 hover:text-primary-dark"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 font-medium bg-yellow-50 border border-yellow-300 p-2.5">
                    💡 Akun yang dibuat langsung oleh Admin otomatis berstatus <strong>Disetujui (ACC)</strong> dan bisa langsung digunakan untuk login.
                  </p>

                  <form onSubmit={handleCreateUserSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                        Username *
                      </label>
                      <input
                        type="text"
                        value={newUserForm.username}
                        onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                        required
                        minLength={3}
                        placeholder="cth: nama.anggota"
                        className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-bold outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                        Password Awal *
                      </label>
                      <input
                        type="password"
                        value={newUserForm.password}
                        onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                        required
                        minLength={6}
                        placeholder="Minimal 6 karakter"
                        className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-bold outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                        Tingkat Akses (Role) *
                      </label>
                      <select
                        value={newUserForm.role}
                        onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                        className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-bold outline-none bg-white"
                      >
                        <option value="user">User (Anggota KKN - Akses Upload & Presensi)</option>
                        <option value="admin">Administrator (Akses Penuh Kelola Website & User)</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowAddUserModal(false)}
                        className="px-4 py-2 border-2 border-primary-dark text-xs font-bold text-gray-700 hover:bg-gray-100 uppercase"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={savingNewUser}
                        className="px-4 py-2 border-2 border-primary-dark bg-gradient-green text-white text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
                      >
                        <Save size={14} /> {savingNewUser ? 'Menyimpan...' : 'Buat Akun'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL: RESET PASSWORD */}
            {resetPasswordModalUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white border-4 border-primary-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b-2 border-primary-dark pb-3">
                    <h3 className="text-lg font-black text-primary-dark uppercase flex items-center gap-2">
                      <Key size={20} /> Reset Password
                    </h3>
                    <button
                      onClick={() => setResetPasswordModalUser(null)}
                      className="p-1 text-gray-400 hover:text-primary-dark"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div>
                    <span className="text-xs text-gray-500 font-medium">Mereset sandi untuk akun:</span>
                    <p className="text-sm font-black text-primary-dark mt-0.5 uppercase bg-gray-100 p-2 border border-primary-dark">
                      {resetPasswordModalUser.username}
                    </p>
                  </div>

                  <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                        Password Baru *
                      </label>
                      <input
                        type="password"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Minimal 6 karakter"
                        className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-bold outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setResetPasswordModalUser(null)}
                        className="px-4 py-2 border-2 border-primary-dark text-xs font-bold text-gray-700 hover:bg-gray-100 uppercase"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={savingResetPassword}
                        className="px-4 py-2 border-2 border-primary-dark bg-gradient-blue text-white text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
                      >
                        <Lock size={14} /> {savingResetPassword ? 'Menyimpan...' : 'Perbarui Sandi'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: KELOLA BERITA, PUBLIKASI & MODUL (ADMIN ONLY EDIT & DELETE) */}
        {isAdmin && activeTab === 'articles' && (
          <div className="bg-white border-2 border-primary-dark shadow-hard p-6 space-y-6">
            <div className="border-b-2 border-primary-dark pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-primary-dark uppercase flex items-center gap-2">
                  <BookOpen size={22} /> Kelola Berita, Publikasi & Modul
                </h2>
                <p className="text-xs text-gray-600 font-medium">
                  Pengubahan (edit) dan penghapusan konten hanya dapat dilakukan oleh Admin.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/upload"
                  className="bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-3 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1"
                >
                  <PlusCircle size={14} /> + Upload Baru
                </Link>
                <Link
                  to="/berita"
                  target="_blank"
                  className="text-xs font-bold text-primary-dark underline hover:text-secondary-dark"
                >
                  Lihat Berita Publik ↗
                </Link>
              </div>
            </div>

            {articleActionMsg.message && (
              <div className={`p-3 border-2 text-xs font-bold shadow-hard flex items-center gap-2 ${
                articleActionMsg.type === 'success' 
                  ? 'bg-green-50 border-accent-dark text-accent-dark' 
                  : 'bg-red-50 border-red-600 text-red-600'
              }`}>
                {articleActionMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span>{articleActionMsg.message}</span>
              </div>
            )}

            {/* Form Edit Artikel / Publikasi / Modul (Jika sedang mode edit) */}
            {editingArticle && (
              <form onSubmit={handleSaveArticle} className="bg-yellow-50 border-2 border-primary-dark p-5 space-y-4 shadow-hard">
                <div className="flex items-center justify-between border-b border-primary-dark pb-2">
                  <h4 className="text-sm font-black uppercase text-primary-dark flex items-center gap-1.5">
                    <Pencil size={16} /> Edit Postingan: {editingArticle.title}
                  </h4>
                  <button
                    type="button"
                    onClick={handleCancelEditArticle}
                    className="text-xs font-bold text-red-600 flex items-center gap-1 hover:underline"
                  >
                    <X size={14} /> Batal Edit
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-primary-dark font-bold text-xs uppercase mb-1">
                      Judul *
                    </label>
                    <input
                      type="text"
                      value={editArticleForm.title}
                      onChange={(e) => setEditArticleForm({ ...editArticleForm, title: e.target.value })}
                      required
                      className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-primary-dark font-bold text-xs uppercase mb-1">
                      Kategori *
                    </label>
                    <select
                      value={editArticleForm.category}
                      onChange={(e) => setEditArticleForm({ ...editArticleForm, category: e.target.value })}
                      className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-white outline-none"
                    >
                      <option value="berita">📰 Berita</option>
                      <option value="publikasi">📑 Publikasi</option>
                      <option value="modul">📚 Modul & Buku</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-primary-dark font-bold text-xs uppercase mb-1">
                      Ganti Foto Sampul (Opsional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditArticleImage(e.target.files[0] || null)}
                      className="w-full border-2 border-primary-dark p-1 text-xs bg-white"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-primary-dark font-bold text-xs uppercase mb-1">
                      Ganti Berkas Dokumen/Modul (PDF/Doc) (Opsional)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.zip"
                      onChange={(e) => setEditArticleDoc(e.target.files[0] || null)}
                      className="w-full border-2 border-primary-dark p-1 text-xs bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-primary-dark font-bold text-xs uppercase mb-1">
                    Isi Konten *
                  </label>
                  <div className="border-2 border-primary-dark bg-white">
                    <ReactQuill
                      theme="snow"
                      value={editArticleForm.content}
                      onChange={(val) => setEditArticleForm({ ...editArticleForm, content: val })}
                      className="min-h-[180px]"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={savingArticle}
                    className="bg-gradient-green text-white font-black text-xs uppercase px-5 py-2.5 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
                  >
                    <Save size={14} /> {savingArticle ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEditArticle}
                    className="bg-gray-200 text-primary-dark font-black text-xs uppercase px-4 py-2.5 border-2 border-primary-dark"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}

            {/* Filter Kategori */}
            <div className="flex gap-2 border-b border-gray-200 pb-3">
              {['all', 'berita', 'publikasi', 'modul'].map((c) => (
                <button
                  key={c}
                  onClick={() => setArticleCategoryFilter(c)}
                  className={`px-3 py-1.5 font-black text-xs uppercase border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                    articleCategoryFilter === c
                      ? 'bg-gradient-blue text-white translate-y-0.5 shadow-none'
                      : 'bg-white text-primary-dark hover:bg-gray-100'
                  }`}
                >
                  {c === 'all' ? 'Semua' : c.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Tabel Konten */}
            {loadingArticles ? (
              <p className="text-xs font-bold text-gray-500">Memuat data artikel...</p>
            ) : articlesList.length === 0 ? (
              <p className="text-xs font-medium text-gray-500 italic">Belum ada artikel pada kategori ini.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gradient-blue text-white text-xs uppercase">
                      <th className="p-2.5 border-2 border-primary-dark">Kategori</th>
                      <th className="p-2.5 border-2 border-primary-dark">Judul</th>
                      <th className="p-2.5 border-2 border-primary-dark">Penulis</th>
                      <th className="p-2.5 border-2 border-primary-dark">Waktu</th>
                      <th className="p-2.5 border-2 border-primary-dark text-center">Berkas</th>
                      <th className="p-2.5 border-2 border-primary-dark text-center">Aksi (Admin)</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {articlesList.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="p-2.5 border-2 border-primary-dark">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 border border-primary-dark ${
                            item.category === 'publikasi'
                              ? 'bg-green-100 text-green-900 border-green-800'
                              : item.category === 'modul'
                              ? 'bg-yellow-100 text-yellow-900 border-yellow-800'
                              : 'bg-blue-100 text-blue-900 border-blue-800'
                          }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="p-2.5 border-2 border-primary-dark font-bold text-primary-dark max-w-xs truncate">
                          {item.title}
                        </td>
                        <td className="p-2.5 border-2 border-primary-dark text-gray-700 font-medium">
                          {item.author_name || 'Tim KKN'}
                        </td>
                        <td className="p-2.5 border-2 border-primary-dark text-gray-500">
                          {new Date(item.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="p-2.5 border-2 border-primary-dark text-center">
                          {item.file_url ? (
                            <a
                              href={`http://localhost:5000${item.file_url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-accent-dark hover:underline font-bold text-[11px] inline-flex items-center gap-1"
                            >
                              <Download size={12} /> Unduh
                            </a>
                          ) : (
                            <span className="text-gray-400 text-[10px]">-</span>
                          )}
                        </td>
                        <td className="p-2.5 border-2 border-primary-dark text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleStartEditArticle(item)}
                              className="p-1.5 bg-yellow-400 hover:bg-yellow-500 border border-primary-dark text-primary-dark"
                              title="Edit Konten (Hanya Admin)"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteArticle(item.id)}
                              className="p-1.5 bg-red-600 hover:bg-red-700 text-white border border-primary-dark"
                              title="Hapus Konten (Hanya Admin)"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: KELOLA PROFIL & TIM */}
        {isAdmin && activeTab === 'profile' && (
          <div className="space-y-10">
            <div className="bg-white border-2 border-primary-dark shadow-hard p-6">
              <div className="flex items-center justify-between border-b-2 border-primary-dark pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-black text-primary-dark uppercase flex items-center gap-2">
                    <Compass size={22} /> Edit Informasi Profil & Desa
                  </h2>
                </div>
                <Link to="/profile" target="_blank" className="text-xs font-bold text-primary-dark underline">
                  Lihat Halaman Profil ↗
                </Link>
              </div>

              {profileSaveMsg.message && (
                <div className={`mb-6 p-3 border-2 text-xs font-bold shadow-hard flex items-center gap-2 ${
                  profileSaveMsg.type === 'success' 
                    ? 'bg-green-50 border-accent-dark text-accent-dark' 
                    : 'bg-red-50 border-red-600 text-red-600'
                }`}>
                  {profileSaveMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span>{profileSaveMsg.message}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                      Judul Tentang Kami
                    </label>
                    <input
                      type="text"
                      name="about_title"
                      value={profileForm.about_title}
                      onChange={handleProfileChange}
                      required
                      className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                      Deskripsi Tentang KKN
                    </label>
                    <textarea
                      name="about_description"
                      rows={3}
                      value={profileForm.about_description}
                      onChange={handleProfileChange}
                      required
                      className="w-full border-2 border-primary-dark p-3 text-xs font-medium bg-gray-50 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                      Visi KKN
                    </label>
                    <textarea
                      name="vision"
                      rows={3}
                      value={profileForm.vision}
                      onChange={handleProfileChange}
                      required
                      className="w-full border-2 border-primary-dark p-3 text-xs font-medium bg-gray-50 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                      Misi KKN
                    </label>
                    <textarea
                      name="mission"
                      rows={3}
                      value={profileForm.mission}
                      onChange={handleProfileChange}
                      required
                      className="w-full border-2 border-primary-dark p-3 text-xs font-medium bg-gray-50 outline-none"
                    />
                  </div>
                </div>

                <div className="border-t-2 border-dashed border-gray-300 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                      Nama Desa
                    </label>
                    <input
                      type="text"
                      name="village_name"
                      value={profileForm.village_name}
                      onChange={handleProfileChange}
                      required
                      className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                      Deskripsi Profil Desa
                    </label>
                    <textarea
                      name="village_description"
                      rows={3}
                      value={profileForm.village_description}
                      onChange={handleProfileChange}
                      required
                      className="w-full border-2 border-primary-dark p-3 text-xs font-medium bg-gray-50 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                      Populasi (cth: 5,420 Jiwa)
                    </label>
                    <input
                      type="text"
                      name="village_population"
                      value={profileForm.village_population}
                      onChange={handleProfileChange}
                      required
                      className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                      RT / RW (cth: 12 / 04)
                    </label>
                    <input
                      type="text"
                      name="village_rtrw"
                      value={profileForm.village_rtrw}
                      onChange={handleProfileChange}
                      required
                      className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                      Luas Wilayah (cth: 3.2 km²)
                    </label>
                    <input
                      type="text"
                      name="village_area"
                      value={profileForm.village_area}
                      onChange={handleProfileChange}
                      required
                      className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                      Latitude
                    </label>
                    <input
                      type="text"
                      name="village_latitude"
                      value={profileForm.village_latitude}
                      onChange={handleProfileChange}
                      required
                      className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                      Longitude
                    </label>
                    <input
                      type="text"
                      name="village_longitude"
                      value={profileForm.village_longitude}
                      onChange={handleProfileChange}
                      required
                      className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-primary-dark font-black text-xs uppercase mb-1">
                      Label Penanda (Marker)
                    </label>
                    <input
                      type="text"
                      name="village_map_label"
                      value={profileForm.village_map_label}
                      onChange={handleProfileChange}
                      required
                      className="w-full border-2 border-primary-dark px-3 py-2 text-xs font-medium bg-gray-50 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-gradient-green text-white font-black text-xs uppercase px-6 py-3 border-2 border-primary-dark shadow-hard hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                  <Save size={16} /> Simpan Pembaruan Profil & Desa
                </button>
              </form>
            </div>

            {/* Kelola Pengurus */}
            <div className="bg-white border-2 border-primary-dark shadow-hard p-6 space-y-6">
              <h2 className="text-xl font-black text-primary-dark uppercase flex items-center gap-2">
                <Users size={22} /> Kelola Susunan Pengurus (Meet Our Team)
              </h2>

              {teamActionMsg.message && (
                <div className={`p-3 border-2 text-xs font-bold shadow-hard flex items-center gap-2 ${
                  teamActionMsg.type === 'success' 
                    ? 'bg-green-50 border-accent-dark text-accent-dark' 
                    : 'bg-red-50 border-red-600 text-red-600'
                }`}>
                  {teamActionMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span>{teamActionMsg.message}</span>
                </div>
              )}

              <form onSubmit={handleSaveMember} className="bg-gray-50 border-2 border-primary-dark p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Nama *</label>
                    <input
                      type="text"
                      name="name"
                      value={memberForm.name}
                      onChange={handleMemberFormChange}
                      required
                      className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs font-medium bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Jabatan *</label>
                    <input
                      type="text"
                      name="role"
                      value={memberForm.role}
                      onChange={handleMemberFormChange}
                      required
                      className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs font-medium bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Jurusan</label>
                    <input
                      type="text"
                      name="major"
                      value={memberForm.major}
                      onChange={handleMemberFormChange}
                      className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs font-medium bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Urutan</label>
                    <input
                      type="number"
                      name="display_order"
                      value={memberForm.display_order}
                      onChange={handleMemberFormChange}
                      className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs font-medium bg-white outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2 md:col-span-4">
                    <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Foto Anggota</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMemberImageChange}
                      className="w-full border-2 border-primary-dark p-1 text-xs bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingMember}
                  className="bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-4 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5"
                >
                  <Save size={14} /> {editingMemberId ? 'Perbarui Anggota' : 'Simpan Anggota Baru'}
                </button>
              </form>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gradient-blue text-white text-xs uppercase">
                      <th className="p-2.5 border-2 border-primary-dark">Foto</th>
                      <th className="p-2.5 border-2 border-primary-dark">Nama</th>
                      <th className="p-2.5 border-2 border-primary-dark">Jabatan</th>
                      <th className="p-2.5 border-2 border-primary-dark">Jurusan</th>
                      <th className="p-2.5 border-2 border-primary-dark text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {teamList.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="p-2 border-2 border-primary-dark text-center">
                          {m.image_url ? (
                            <img
                              src={`http://localhost:5000${m.image_url}`}
                              alt={m.name}
                              className="w-10 h-10 object-cover border border-primary-dark mx-auto"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-primary-dark text-white flex items-center justify-center font-bold text-sm mx-auto">
                              {m.name.charAt(0)}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 border-2 border-primary-dark font-bold text-primary-dark">{m.name}</td>
                        <td className="p-2.5 border-2 border-primary-dark font-bold">{m.role}</td>
                        <td className="p-2.5 border-2 border-primary-dark text-gray-600">{m.major || '-'}</td>
                        <td className="p-2.5 border-2 border-primary-dark text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleStartEditMember(m)}
                              className="p-1.5 bg-yellow-400 hover:bg-yellow-500 border border-primary-dark"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(m.id)}
                              className="p-1.5 bg-red-600 hover:bg-red-700 text-white border border-primary-dark"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: KELOLA MEDIA & MEDSOS */}
        {isAdmin && activeTab === 'media' && (
          <div className="space-y-10">
            <div className="bg-white border-2 border-primary-dark shadow-hard p-6 space-y-6">
              <div className="border-b-2 border-primary-dark pb-3 flex items-center justify-between">
                <h2 className="text-xl font-black text-primary-dark uppercase flex items-center gap-2">
                  <Share2 size={22} /> Akun Media Sosial Resmi KKN
                </h2>
                <Link to="/media" target="_blank" className="text-xs font-bold text-primary-dark underline">
                  Lihat Halaman Media ↗
                </Link>
              </div>

              {socialActionMsg.message && (
                <div className={`p-3 border-2 text-xs font-bold shadow-hard flex items-center gap-2 ${
                  socialActionMsg.type === 'success' ? 'bg-green-50 text-accent-dark' : 'bg-red-50 text-red-600'
                }`}>
                  <span>{socialActionMsg.message}</span>
                </div>
              )}

              <form onSubmit={handleSaveSocialLink} className="bg-gray-50 border-2 border-primary-dark p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Platform *</label>
                    <select
                      value={socialForm.platform}
                      onChange={(e) => setSocialForm({ ...socialForm, platform: e.target.value })}
                      className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs bg-white outline-none"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="youtube">YouTube</option>
                      <option value="tiktok">TikTok</option>
                      <option value="facebook">Facebook</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Username / Handle *</label>
                    <input
                      type="text"
                      value={socialForm.username_handle}
                      onChange={(e) => setSocialForm({ ...socialForm, username_handle: e.target.value })}
                      required
                      placeholder="@kkn_vidyavardhana"
                      className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">URL Profil *</label>
                    <input
                      type="url"
                      value={socialForm.url}
                      onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
                      required
                      placeholder="https://instagram.com/..."
                      className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs bg-white outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-4 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  Tambahkan Akun Medsos
                </button>
              </form>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gradient-blue text-white uppercase">
                      <th className="p-2.5 border-2 border-primary-dark">Platform</th>
                      <th className="p-2.5 border-2 border-primary-dark">Handle</th>
                      <th className="p-2.5 border-2 border-primary-dark">URL</th>
                      <th className="p-2.5 border-2 border-primary-dark text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {socialLinksList.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="p-2.5 border-2 border-primary-dark font-bold uppercase">{s.platform}</td>
                        <td className="p-2.5 border-2 border-primary-dark font-bold">{s.username_handle}</td>
                        <td className="p-2.5 border-2 border-primary-dark truncate max-w-xs">{s.url}</td>
                        <td className="p-2.5 border-2 border-primary-dark text-center">
                          <button
                            onClick={() => handleDeleteSocialLink(s.id)}
                            className="p-1.5 bg-red-600 text-white border border-primary-dark"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Kelola Video Embed Autoplay */}
            <div className="bg-white border-2 border-primary-dark shadow-hard p-6 space-y-6">
              <h2 className="text-xl font-black text-primary-dark uppercase flex items-center gap-2">
                <Play size={22} /> Kelola Video Tersemat (Autoplay)
              </h2>

              {mediaActionMsg.message && (
                <div className={`p-3 border-2 text-xs font-bold shadow-hard flex items-center gap-2 ${
                  mediaActionMsg.type === 'success' ? 'bg-green-50 text-accent-dark' : 'bg-red-50 text-red-600'
                }`}>
                  <span>{mediaActionMsg.message}</span>
                </div>
              )}

              <form onSubmit={handleSaveMedia} className="bg-gray-50 border-2 border-primary-dark p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Judul Video *</label>
                    <input
                      type="text"
                      name="title"
                      value={mediaForm.title}
                      onChange={handleMediaFormChange}
                      required
                      className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Platform *</label>
                    <select
                      name="platform"
                      value={mediaForm.platform}
                      onChange={handleMediaFormChange}
                      className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs bg-white outline-none"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Urutan</label>
                    <input
                      type="number"
                      name="display_order"
                      value={mediaForm.display_order}
                      onChange={handleMediaFormChange}
                      className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs bg-white outline-none"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">URL Video *</label>
                    <input
                      type="url"
                      name="url"
                      value={mediaForm.url}
                      onChange={handleMediaFormChange}
                      required
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full border-2 border-primary-dark px-2.5 py-1.5 text-xs bg-white outline-none"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-primary-dark font-bold text-[11px] uppercase mb-1">Caption</label>
                    <textarea
                      name="caption"
                      rows={2}
                      value={mediaForm.caption}
                      onChange={handleMediaFormChange}
                      className="w-full border-2 border-primary-dark p-2 text-xs bg-white outline-none"
                    />
                  </div>
                  <div className="md:col-span-4 flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-300">
                    <input
                      type="checkbox"
                      id="is_autoplay"
                      name="is_autoplay"
                      checked={mediaForm.is_autoplay === 1}
                      onChange={handleMediaFormChange}
                      className="w-4 h-4"
                    />
                    <label htmlFor="is_autoplay" className="text-xs font-bold text-primary-dark">
                      Putar Otomatis (Autoplay Video)
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={savingMedia}
                  className="bg-gradient-yellow text-primary-dark font-black text-xs uppercase px-4 py-2 border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Save size={14} /> {editingMediaId ? 'Perbarui Media' : 'Simpan Media Baru'}
                </button>
              </form>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gradient-blue text-white uppercase">
                      <th className="p-2.5 border-2 border-primary-dark">Platform</th>
                      <th className="p-2.5 border-2 border-primary-dark">Judul</th>
                      <th className="p-2.5 border-2 border-primary-dark">URL</th>
                      <th className="p-2.5 border-2 border-primary-dark text-center">Autoplay</th>
                      <th className="p-2.5 border-2 border-primary-dark text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mediaList.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="p-2.5 border-2 border-primary-dark font-bold uppercase">{item.platform}</td>
                        <td className="p-2.5 border-2 border-primary-dark font-bold">{item.title}</td>
                        <td className="p-2.5 border-2 border-primary-dark truncate max-w-xs">{item.url}</td>
                        <td className="p-2.5 border-2 border-primary-dark text-center font-bold">
                          {item.is_autoplay === 1 ? 'Ya' : 'Tidak'}
                        </td>
                        <td className="p-2.5 border-2 border-primary-dark text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleStartEditMedia(item)}
                              className="p-1.5 bg-yellow-400 border border-primary-dark"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteMedia(item.id)}
                              className="p-1.5 bg-red-600 text-white border border-primary-dark"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM BRANDED CONFIRMATION / ALERT MODAL */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          showCancel={confirmModal.showCancel}
          type={confirmModal.type}
          onConfirm={confirmModal.onConfirm}
          onCancel={closeConfirmModal}
          isLoading={confirmModal.isLoading}
        />

      </div>
    </div>
  );
}
