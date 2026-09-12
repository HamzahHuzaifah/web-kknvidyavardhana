import React from 'react';
import { Clock, MapPin, CheckCircle, AlertCircle, Users } from 'lucide-react';

export default function AttendanceTab({
  attendanceList,
  loadingAttendance,
  clockInStatus,
  isClockingIn,
  onClockIn
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* CLOCK IN BOX */}
      <div className="md:col-span-1 bg-white border-2 border-primary-dark shadow-hard p-6 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute top-[-20%] left-[-20%] w-32 h-32 bg-gradient-yellow rounded-full mix-blend-multiply opacity-50 z-0 pointer-events-none"></div>

        <Clock size={44} className="text-primary-dark mb-4 relative z-10" />
        <h3 className="text-xl font-black text-primary-dark uppercase mb-2 relative z-10">Presensi Harian</h3>
        <p className="text-gray-600 mb-6 text-xs font-medium relative z-10">
          Catat kehadiran Anda beserta koordinat GPS lokasi KKN.
        </p>

        <button
          onClick={onClockIn}
          disabled={isClockingIn}
          className="w-full bg-gradient-green text-white font-bold py-3 border-2 border-primary-dark shadow-hard hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-70 relative z-10 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
        >
          {isClockingIn ? (
            'Mencari Lokasi...'
          ) : (
            <>
              <MapPin size={16} /> Clock In (Presensi)
            </>
          )}
        </button>

        {clockInStatus.message && (
          <div
            className={`mt-4 w-full p-3 border-2 text-xs font-bold shadow-hard relative z-10 flex items-start gap-2 ${
              clockInStatus.type === 'success'
                ? 'bg-green-50 border-accent-dark text-accent-dark'
                : 'bg-red-50 border-red-600 text-red-600'
            }`}
          >
            {clockInStatus.type === 'success' ? (
              <CheckCircle size={16} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
            )}
            <span className="text-left">{clockInStatus.message}</span>
          </div>
        )}
      </div>

      {/* ATTENDANCE HISTORY */}
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
  );
}
