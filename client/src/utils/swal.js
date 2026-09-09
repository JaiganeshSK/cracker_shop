import Swal from 'sweetalert2';

// Custom SweetAlert2 Toast configuration for subtle top-right feedback
export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#0f172a',
  color: '#f8fafc',
  iconColor: '#f59e0b',
  customClass: {
    popup: 'border border-slate-800 shadow-2xl rounded-2xl text-xs sm:text-sm font-medium',
  },
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

// Helper for success toast
export const showSuccessToast = (title) => {
  return Toast.fire({
    icon: 'success',
    title,
    iconColor: '#10b981',
  });
};

// Helper for error toast
export const showErrorToast = (title) => {
  return Toast.fire({
    icon: 'error',
    title,
    iconColor: '#f43f5e',
  });
};

// Helper for info toast
export const showInfoToast = (title) => {
  return Toast.fire({
    icon: 'info',
    title,
    iconColor: '#38bdf8',
  });
};

// Production styled confirmation dialog
export const showConfirmDialog = async ({
  title = 'Are you sure?',
  text = '',
  confirmButtonText = 'Yes, Proceed',
  cancelButtonText = 'Cancel',
  icon = 'warning',
  confirmColor = 'amber',
}) => {
  const isDanger = confirmColor === 'rose' || confirmColor === 'red';

  const confirmBtnClass = isDanger
    ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-rose-500/20 text-xs sm:text-sm transition-all cursor-pointer'
    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 text-xs sm:text-sm transition-all cursor-pointer';

  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    background: '#0f172a',
    color: '#f8fafc',
    iconColor: isDanger ? '#f43f5e' : '#f59e0b',
    customClass: {
      popup: 'border border-slate-800 shadow-2xl rounded-3xl p-5 sm:p-7 text-slate-100 max-w-md w-[92vw]',
      title: 'text-lg sm:text-xl font-black text-white tracking-tight',
      htmlContainer: 'text-xs sm:text-sm text-slate-300 mt-2',
      confirmButton: confirmBtnClass,
      cancelButton: 'bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-5 py-2.5 rounded-xl border border-slate-700 text-xs sm:text-sm transition-all cursor-pointer',
      actions: 'gap-3 mt-5 w-full justify-end',
    },
    buttonsStyling: false,
  });
};

// Production styled modal notification (for informative warnings / alerts)
export const showNotification = ({
  title,
  text,
  icon = 'info',
  confirmButtonText = 'Got it',
}) => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonText,
    background: '#0f172a',
    color: '#f8fafc',
    iconColor: icon === 'warning' ? '#f59e0b' : icon === 'error' ? '#f43f5e' : '#10b981',
    customClass: {
      popup: 'border border-slate-800 shadow-2xl rounded-3xl p-5 sm:p-7 text-slate-100 max-w-md w-[92vw]',
      title: 'text-lg sm:text-xl font-black text-white tracking-tight',
      htmlContainer: 'text-xs sm:text-sm text-slate-300 mt-2',
      confirmButton: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 text-xs sm:text-sm transition-all cursor-pointer',
      actions: 'mt-5',
    },
    buttonsStyling: false,
  });
};

export default Swal;
