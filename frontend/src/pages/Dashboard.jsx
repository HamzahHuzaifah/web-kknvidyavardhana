import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Clock, 
  ShieldCheck, 
  UploadCloud, 
  Compass, 
  Video, 
  BookOpen, 
  FolderOpen 
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../components/ConfirmModal';
import UsersTab from '../components/dashboard/UsersTab';
import ArticlesTab from '../components/dashboard/ArticlesTab';
import FileManagerTab from '../components/dashboard/FileManagerTab';
import ProfileTab from '../components/dashboard/ProfileTab';
import SocialMediaTab from '../components/dashboard/SocialMediaTab';

import AddUserModal from '../components/dashboard/modals/AddUserModal';
import ResetPasswordModal from '../components/dashboard/modals/ResetPasswordModal';
import PreviewMediaModal from '../components/dashboard/modals/PreviewMediaModal';
import MediaPickerModal from '../components/dashboard/modals/MediaPickerModal';

export default function Dashboard() {
  const username = localStorage.getItem('username') || 'Pengguna';
  const role = localStorage.getItem('role') || 'user';
  const isAdmin = role === 'admin';

  const [activeTab, setActiveTab] = useState(isAdmin ? 'users' : 'welcome');
  
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


  // User management state
  const [userList, setUserList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [adminActionMsg, setAdminActionMsg] = useState({ type: '', message: '' });
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  // Add User & Reset Password Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ username: '', password: '', role: 'user' });
  const [savingNewUser, setSavingNewUser] = useState(false);

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

  // Articles & Publications state
  const [articlesList, setArticlesList] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [articleCategoryFilter, setArticleCategoryFilter] = useState('all');
  const [articleActionMsg, setArticleActionMsg] = useState({ type: '', message: '' });
  const [editingArticle, setEditingArticle] = useState(null);
  const [editArticleForm, setEditArticleForm] = useState({
    title: '',
    category: 'berita',
    content: '',
    abstract: '',
    keywords: '',
    authors_meta: '',
    doi_or_reg: ''
  });
  const [editArticleImage, setEditArticleImage] = useState(null);
  const [editArticleDoc, setEditArticleDoc] = useState(null);
  const [savingArticle, setSavingArticle] = useState(false);

  // Media Library / Manajer Berkas state
  const [fileList, setFileList] = useState([]);
  const [fileCounts, setFileCounts] = useState({ total: 0, images: 0, videos: 0, documents: 0, others: 0 });
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [fileSourceFilter, setFileSourceFilter] = useState('all');
  const [fileSearchTerm, setFileSearchTerm] = useState('');
  const [fileUploading, setFileUploading] = useState(false);
  const [fileActionMsg, setFileActionMsg] = useState({ type: '', message: '' });
  const [previewMediaModal, setPreviewMediaModal] = useState(null);
  const [activeLogoUrl, setActiveLogoUrl] = useState('');
  const [copiedUrl, setCopiedUrl] = useState('');
  const [showMediaPickerModal, setShowMediaPickerModal] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState('image');
  const [selectedMediaForArticle, setSelectedMediaForArticle] = useState({ image: null, document: null });



  // Helper format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };



  // Fetch Users
  const fetchUsers = async () => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
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
        axios.get('/api/profile-info'),
        axios.get('/api/team')
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
        if (profileRes.data.logo_url) {
          setActiveLogoUrl(profileRes.data.logo_url);
        }
      }
      setTeamList(teamRes.data || []);
    } catch (error) {
      console.error('Error fetching profile & team:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Fetch Media Files
  const fetchMediaFiles = async () => {
    if (!isAdmin) return;
    setLoadingFiles(true);
    try {
      const token = localStorage.getItem('token');
      let url = `/api/files?type=${fileTypeFilter}&source=${fileSourceFilter}`;
      if (fileSearchTerm.trim()) {
        url += `&q=${encodeURIComponent(fileSearchTerm.trim())}`;
      }
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFileList(response.data.files || []);
      setFileCounts(response.data.counts || { total: 0, images: 0, videos: 0, documents: 0, others: 0 });
    } catch (err) {
      console.error('Error fetching media files:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Upload Files to Media Library
  const handleUploadMediaFiles = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setFileUploading(true);
    setFileActionMsg({ type: '', message: '' });

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('source', 'direct_upload');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/files/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setFileActionMsg({ type: 'success', message: res.data.message });
      fetchMediaFiles();
      e.target.value = '';
    } catch (err) {
      setFileActionMsg({
        type: 'error',
        message: err.response?.data?.error || 'Gagal mengunggah berkas ke Manajer Berkas.'
      });
    } finally {
      setFileUploading(false);
    }
  };

  // Set File as Active Website Logo
  const handleSetAsLogo = (fileUrl) => {
    setConfirmModal({
      isOpen: true,
      title: 'Pasang Sebagai Logo Website',
      message: 'Apakah Anda yakin ingin memasang gambar ini sebagai Logo Resmi Website KKN Vidya Vardhana? Logo akan langsung diperbarui di bilah navigasi (Navbar).',
      confirmText: 'Ya, Pasang Logo',
      cancelText: 'Batal',
      showCancel: true,
      type: 'warning',
      onConfirm: async () => {
        closeConfirmModal();
        try {
          const token = localStorage.getItem('token');
          const res = await axios.put(
            '/api/settings/logo',
            { logo_url: fileUrl },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setActiveLogoUrl(fileUrl);
          setFileActionMsg({ type: 'success', message: res.data.message });
          window.dispatchEvent(new CustomEvent('logoUpdated', { detail: { logo_url: fileUrl } }));
        } catch (err) {
          setFileActionMsg({
            type: 'error',
            message: err.response?.data?.error || 'Gagal memasang logo website.'
          });
        }
      },
      isLoading: false
    });
  };

  // Delete Media File
  const handleDeleteMediaFile = (file) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Berkas Permanen',
      message: `Apakah Anda yakin ingin menghapus berkas "${file.original_name}" secara permanen? Berkas fisik akan dihapus dari server dan tidak dapat dipulihkan.`,
      confirmText: 'Ya, Hapus Permanen',
      cancelText: 'Batal',
      showCancel: true,
      type: 'danger',
      onConfirm: async () => {
        closeConfirmModal();
        try {
          const token = localStorage.getItem('token');
          const res = await axios.delete(`/api/files/${file.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setFileActionMsg({ type: 'success', message: res.data.message });
          if (activeLogoUrl === file.file_url) {
            setActiveLogoUrl('');
            window.dispatchEvent(new CustomEvent('logoUpdated', { detail: { logo_url: '' } }));
          }
          fetchMediaFiles();
        } catch (err) {
          setFileActionMsg({
            type: 'error',
            message: err.response?.data?.error || 'Gagal menghapus berkas.'
          });
        }
      },
      isLoading: false
    });
  };

  // Copy File URL
  const handleCopyFileUrl = (url) => {
    const fullUrl = url.startsWith('http') ? url : `${url}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(''), 2500);
    }).catch(() => {
      showAlert('Gagal menyalin link ke clipboard.');
    });
  };

  // Fetch Media & Social Links
  const fetchMediaAndSocial = async () => {
    if (!isAdmin) return;
    setLoadingMedia(true);
    try {
      const [mediaRes, socialRes] = await Promise.all([
        axios.get('/api/media'),
        axios.get('/api/social-links')
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
      let url = '/api/articles';
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
      fetchMediaFiles();
    }
  }, [isAdmin, articleCategoryFilter, fileTypeFilter, fileSourceFilter]);

  // Update User Status
  const handleUpdateUserStatus = async (userId, targetStatus) => {
    setAdminActionMsg({ type: '', message: '' });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `/api/admin/users/${userId}/status`,
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

  // Update User Role
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
            `/api/admin/users/${userId}/role`,
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
            `/api/admin/users/${userId}`,
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

  // Reset Password Submit
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
        `/api/admin/users/${resetPasswordModalUser.id}/reset-password`,
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

  // Create User Submit
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
        '/api/admin/users',
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
            '/api/attendance',
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
      const response = await axios.put('/api/profile-info', profileForm, {
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
        await axios.put(`/api/team/${editingMemberId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setTeamActionMsg({ type: 'success', message: 'Data anggota tim berhasil diperbarui!' });
      } else {
        await axios.post('/api/team', formData, {
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
          await axios.delete(`/api/team/${id}`, {
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
        await axios.put(`/api/media/${editingMediaId}`, mediaForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMediaActionMsg({ type: 'success', message: 'Konten media berhasil diperbarui!' });
      } else {
        await axios.post('/api/media', mediaForm, {
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
          await axios.delete(`/api/media/${id}`, {
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
      await axios.post('/api/social-links', socialForm, {
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
          await axios.delete(`/api/social-links/${id}`, {
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

  // Article Edit & Delete Handlers
  const handleStartEditArticle = (article) => {
    setEditingArticle(article);
    setEditArticleForm({
      title: article.title,
      category: article.category || 'berita',
      content: article.content,
      abstract: article.abstract || '',
      keywords: article.keywords || '',
      authors_meta: article.authors_meta || '',
      doi_or_reg: article.doi_or_reg || '',
      image_url: article.image_url || '',
      file_url: article.file_url || ''
    });
    setEditArticleImage(null);
    setEditArticleDoc(null);
    setSelectedMediaForArticle({
      image: article.image_url || null,
      document: article.file_url || null
    });
    setArticleActionMsg({ type: '', message: '' });
  };

  const handleCancelEditArticle = () => {
    setEditingArticle(null);
    setEditArticleForm({ 
      title: '', 
      category: 'berita', 
      content: '', 
      abstract: '',
      keywords: '',
      authors_meta: '',
      doi_or_reg: '',
      image_url: '', 
      file_url: '' 
    });
    setEditArticleImage(null);
    setEditArticleDoc(null);
    setSelectedMediaForArticle({ image: null, document: null });
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
      formData.append('abstract', editArticleForm.abstract || '');
      formData.append('keywords', editArticleForm.keywords || '');
      formData.append('authors_meta', editArticleForm.authors_meta || '');
      formData.append('doi_or_reg', editArticleForm.doi_or_reg || '');
      if (editArticleImage) {
        formData.append('image', editArticleImage);
      } else if (editArticleForm.image_url) {
        formData.append('image_url', editArticleForm.image_url);
      }
      if (editArticleDoc) {
        formData.append('document', editArticleDoc);
      } else if (editArticleForm.file_url) {
        formData.append('file_url', editArticleForm.file_url);
      }

      await axios.put(`/api/articles/${editingArticle.id}`, formData, {
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
          await axios.delete(`/api/articles/${id}`, {
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

  const TabTransition = ({ children, tabKey }) => (
    <motion.div
      key={tabKey}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );

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
                ? 'Panel Pengelolaan: ACC Akun, Profil, Medsos, serta Kelola Berita, Publikasi & Modul.' 
                : 'Hak Akses: Mempublikasikan Berita, Publikasi & Modul KKN.'}
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
              onClick={() => setActiveTab('files')}
              className={`px-3.5 py-2 font-black text-xs uppercase border-2 border-primary-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1.5 ${
                activeTab === 'files'
                  ? 'bg-gradient-yellow text-primary-dark translate-y-0.5 shadow-none'
                  : 'bg-white text-primary-dark hover:bg-gray-100'
              }`}
            >
              <FolderOpen size={15} /> Manajer Berkas
              {fileCounts.total > 0 && (
                <span className="bg-primary-dark text-white text-[10px] px-1.5 py-0.5 rounded-full font-black ml-0.5">
                  {fileCounts.total}
                </span>
              )}
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
          <AttendanceTab
            isAdmin={isAdmin}
            handleClockIn={handleClockIn}
            isClockingIn={isClockingIn}
            clockInStatus={clockInStatus}
            loadingAttendance={loadingAttendance}
            attendanceList={attendanceList}
          />
        )}

        {/* TABS RENDER */}
        <AnimatePresence mode="wait">
          {!isAdmin && activeTab === 'welcome' && (
            <TabTransition tabKey="welcome">
              <div className="bg-white border-2 border-primary-dark shadow-hard p-10 text-center space-y-6">
                <Compass className="w-16 h-16 mx-auto text-primary-dark opacity-20" />
                <h2 className="text-2xl font-black text-primary-dark uppercase">Selamat Datang di Portal KKN</h2>
                <p className="text-gray-600 max-w-lg mx-auto font-medium">
                  Sebagai User (Anggota), Anda memiliki akses untuk mempublikasikan dan membagikan aktivitas KKN melalui Berita, Publikasi & Modul.
                </p>
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 bg-gradient-yellow text-primary-dark font-black px-6 py-3 border-2 border-primary-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all uppercase"
                >
                  <UploadCloud size={20} /> Mulai Upload Konten
                </Link>
              </div>
            </TabTransition>
          )}

          {/* TAB 2: ACC & KELOLA USER */}
          {isAdmin && activeTab === 'users' && (
            <TabTransition tabKey="users">
              <UsersTab
            userList={userList}
            loadingUsers={loadingUsers}
            adminActionMsg={adminActionMsg}
            setAdminActionMsg={setAdminActionMsg}
            userSearchTerm={userSearchTerm}
            setUserSearchTerm={setUserSearchTerm}
            userRoleFilter={userRoleFilter}
            setUserRoleFilter={setUserRoleFilter}
            userStatusFilter={userStatusFilter}
            setUserStatusFilter={setUserStatusFilter}
            onUpdateUserStatus={handleUpdateUserStatus}
            onUpdateUserRole={handleUpdateUserRole}
            onDeleteUser={handleDeleteUser}
            onOpenAddUserModal={() => setShowAddUserModal(true)}
            onOpenResetPasswordModal={(usr) => setResetPasswordModalUser(usr)}
            currentUsername={username}
              />
            </TabTransition>
          )}

          {/* TAB 3: KELOLA BERITA, PUBLIKASI & MODUL */}
          {isAdmin && activeTab === 'articles' && (
            <TabTransition tabKey="articles">
              <ArticlesTab
            articlesList={articlesList}
            loadingArticles={loadingArticles}
            articleCategoryFilter={articleCategoryFilter}
            setArticleCategoryFilter={setArticleCategoryFilter}
            articleActionMsg={articleActionMsg}
            editingArticle={editingArticle}
            editArticleForm={editArticleForm}
            setEditArticleForm={setEditArticleForm}
            selectedMediaForArticle={selectedMediaForArticle}
            setSelectedMediaForArticle={setSelectedMediaForArticle}
            setEditArticleImage={setEditArticleImage}
            setEditArticleDoc={setEditArticleDoc}
            savingArticle={savingArticle}
            handleSaveArticle={handleSaveArticle}
            handleStartEditArticle={handleStartEditArticle}
            handleCancelEditArticle={handleCancelEditArticle}
            handleDeleteArticle={handleDeleteArticle}
            setMediaPickerTarget={setMediaPickerTarget}
            setShowMediaPickerModal={setShowMediaPickerModal}
              />
            </TabTransition>
          )}

          {/* TAB 4: MANAJER BERKAS */}
          {isAdmin && activeTab === 'files' && (
            <TabTransition tabKey="files">
              <FileManagerTab
            fileList={fileList}
            fileCounts={fileCounts}
            loadingFiles={loadingFiles}
            fileTypeFilter={fileTypeFilter}
            setFileTypeFilter={setFileTypeFilter}
            fileSourceFilter={fileSourceFilter}
            setFileSourceFilter={setFileSourceFilter}
            fileSearchTerm={fileSearchTerm}
            setFileSearchTerm={setFileSearchTerm}
            fetchMediaFiles={fetchMediaFiles}
            fileUploading={fileUploading}
            handleUploadMediaFiles={handleUploadMediaFiles}
            fileActionMsg={fileActionMsg}
            setFileActionMsg={setFileActionMsg}
            activeLogoUrl={activeLogoUrl}
            setActiveLogoUrl={setActiveLogoUrl}
            copiedUrl={copiedUrl}
            handleCopyFileUrl={handleCopyFileUrl}
            handleSetAsLogo={handleSetAsLogo}
            handleDeleteMediaFile={handleDeleteMediaFile}
            setPreviewMediaModal={setPreviewMediaModal}
            formatFileSize={formatFileSize}
              />
            </TabTransition>
          )}

          {/* TAB 5: PROFIL & TIM */}
          {isAdmin && activeTab === 'profile' && (
            <TabTransition tabKey="profile">
              <ProfileTab
            profileForm={profileForm}
            handleProfileChange={handleProfileChange}
            handleSaveProfile={handleSaveProfile}
            profileSaveMsg={profileSaveMsg}
            teamList={teamList}
            teamActionMsg={teamActionMsg}
            memberForm={memberForm}
            handleMemberFormChange={handleMemberFormChange}
            handleMemberImageChange={handleMemberImageChange}
            handleSaveMember={handleSaveMember}
            handleStartEditMember={handleStartEditMember}
            editingMemberId={editingMemberId}
            savingMember={savingMember}
            handleDeleteMember={handleDeleteMember}
              />
            </TabTransition>
          )}

          {/* TAB 6: MEDIA & MEDSOS */}
          {isAdmin && activeTab === 'media' && (
            <TabTransition tabKey="media">
              <SocialMediaTab
                socialLinksList={socialLinksList}
                socialForm={socialForm}
                setSocialForm={setSocialForm}
                handleSaveSocialLink={handleSaveSocialLink}
                handleDeleteSocialLink={handleDeleteSocialLink}
                socialActionMsg={socialActionMsg}
                mediaList={mediaList}
                mediaForm={mediaForm}
                handleMediaFormChange={handleMediaFormChange}
                handleSaveMedia={handleSaveMedia}
                handleStartEditMedia={handleStartEditMedia}
                editingMediaId={editingMediaId}
                savingMedia={savingMedia}
                handleDeleteMedia={handleDeleteMedia}
                mediaActionMsg={mediaActionMsg}
              />
            </TabTransition>
          )}
        </AnimatePresence>

        {/* MODALS */}
        <AddUserModal
          isOpen={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          newUserForm={newUserForm}
          setNewUserForm={setNewUserForm}
          handleCreateUserSubmit={handleCreateUserSubmit}
          savingNewUser={savingNewUser}
        />

        <ResetPasswordModal
          resetPasswordModalUser={resetPasswordModalUser}
          onClose={() => setResetPasswordModalUser(null)}
          newPasswordInput={newPasswordInput}
          setNewPasswordInput={setNewPasswordInput}
          handleResetPasswordSubmit={handleResetPasswordSubmit}
          savingResetPassword={savingResetPassword}
        />

        <PreviewMediaModal
          previewMediaModal={previewMediaModal}
          onClose={() => setPreviewMediaModal(null)}
          formatFileSize={formatFileSize}
          copiedUrl={copiedUrl}
          handleCopyFileUrl={handleCopyFileUrl}
          handleSetAsLogo={handleSetAsLogo}
        />

        <MediaPickerModal
          isOpen={showMediaPickerModal}
          onClose={() => setShowMediaPickerModal(false)}
          target={mediaPickerTarget}
          files={fileList}
          formatFileSize={formatFileSize}
          onSelectFile={(file, target) => {
            if (target === 'image') {
              setSelectedMediaForArticle(prev => ({ ...prev, image: file.file_url }));
              setEditArticleForm(prev => ({ ...prev, image_url: file.file_url }));
              setEditArticleImage(null);
            } else {
              setSelectedMediaForArticle(prev => ({ ...prev, document: file.original_name }));
              setEditArticleForm(prev => ({ ...prev, file_url: file.file_url }));
              setEditArticleDoc(null);
            }
          }}
        />

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
