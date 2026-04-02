import { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText
} from 'lucide-react';
import api from '../../services/api';

const AdminReports = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleDownload = async () => {
    setLoading(true);
    setStatus({ type: '', message: '' });
    
    try {
      // Sesuai dokumentasi Swagger: GET /admin/reports/download?month=X&year=Y
      // Menggunakan responseType: 'blob' agar bisa mendownload file
      const response = await api.get('/api/admin/reports/download', {
        params: { month, year },
        responseType: 'blob'
      });

      // Buat URL untuk file blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Nama file: Laporan_Bulanan_MM_YYYY.xlsx
      const fileName = `Laporan_Pemasukan_${months.find(m => m.value === month).label}_${year}.xlsx`;
      link.setAttribute('download', fileName);
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setStatus({ 
        type: 'success', 
        message: `Laporan ${months.find(m => m.value === month).label} ${year} berhasil diunduh!` 
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      setStatus({ 
        type: 'error', 
        message: 'Gagal mengunduh laporan. Pastikan data tersedia untuk periode tersebut.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Admin Report</h1>
        <p className="text-gray-500 dark:text-gray-400">Buat dan unduh laporan pemasukan bulanan dalam format Excel</p>
      </div>

      <div className="max-w-2xl bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 dark:border-gray-800 bg-orange-50/30 dark:bg-orange-900/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">Laporan Pemasukan</h3>
              <p className="text-xs text-gray-500 font-medium">Pilih periode laporan yang ingin diunduh</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pilih Bulan */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Pilih Bulan</label>
              <div className="relative">
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent rounded-[20px] text-sm font-black text-gray-900 dark:text-white appearance-none outline-none focus:border-orange-500 focus:bg-white transition-all cursor-pointer"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
              </div>
            </div>

            {/* Pilih Tahun */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Pilih Tahun</label>
              <div className="relative">
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent rounded-[20px] text-sm font-black text-gray-900 dark:text-white appearance-none outline-none focus:border-orange-500 focus:bg-white transition-all cursor-pointer"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
              </div>
            </div>
          </div>

          {/* Alert Status */}
          {status.message && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${
              status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <p className="text-xs font-bold">{status.message}</p>
            </div>
          )}

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full py-5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white rounded-[24px] font-black uppercase tracking-wider transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <Download size={24} strokeWidth={2.5} />
            )}
            {loading ? 'Sedang Memproses...' : 'Unduh Laporan Excel'}
          </button>

          <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-4">
            * Laporan mencakup semua transaksi dengan status PAID, CHECK IN, dan CHECK OUT
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
