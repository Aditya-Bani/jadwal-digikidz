import React, { useState } from 'react';
import mascotChild from '@/assets/Mascot Optional CS6-05.png';
import logodk from '@/assets/logodk.png';
import { Calendar, ChevronLeft, ChevronRight, Clock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CalendarPreviewPage() {
  const [selectedDate, setSelectedDate] = useState<number | null>(12);
  const [selectedTime, setSelectedTime] = useState<string | null>('11:00');

  // Days in month mock
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
  const startingDayOfWeek = 3; // Starts on Wednesday (0=Sun, 1=Mon, etc)

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-orange-50 min-h-screen flex items-center justify-center p-4 sm:p-8 font-sans overflow-x-hidden">
      <style>
        {`
          .glass-panel {
              background: rgba(255, 255, 255, 0.85);
              backdrop-filter: blur(24px);
              -webkit-backdrop-filter: blur(24px);
              border: 1px solid rgba(255, 255, 255, 0.6);
              box-shadow: 0 10px 40px -10px rgba(0, 74, 198, 0.1);
          }
        `}
      </style>

      {/* Background blobs for depth */}
      <div className="fixed -z-10 w-[600px] h-[600px] bg-[#004ac6]/5 blur-[120px] rounded-full top-[-200px] right-[-200px]"></div>
      <div className="fixed -z-10 w-[500px] h-[500px] bg-[#fd761a]/5 blur-[100px] rounded-full bottom-[-100px] left-[-100px]"></div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Header/Title */}
        <div className="lg:col-span-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-[#c3c6d7]/30">
              <img src={logodk} alt="Digikidz" className="h-8 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#191c1e]">Penjadwalan Kelas</h1>
              <p className="text-sm text-[#434655]">Pilih tanggal dan waktu untuk sesi belajar.</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-full gap-2 border-[#004ac6]/20 text-[#004ac6] hover:bg-[#004ac6]/10">
            Kembali ke Dashboard
          </Button>
        </div>

        {/* Left: Interactive Calendar */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col">
            
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-[#191c1e]">September 2024</h2>
              </div>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-[#c3c6d7]/50 hover:bg-[#f2f4f6] transition-colors text-[#434655]">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-[#c3c6d7]/50 hover:bg-[#f2f4f6] transition-colors text-[#434655]">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4 text-center">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                <div key={day} className="text-sm font-bold text-[#737686] mb-2">{day}</div>
              ))}
              
              {/* Empty padding days */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square"></div>
              ))}

              {/* Days */}
              {daysInMonth.map((day) => {
                const isSelected = selectedDate === day;
                const isHoliday = day === 17; // Example holiday
                const isPast = day < 10; // Example past dates

                let btnClass = "aspect-square flex flex-col items-center justify-center rounded-2xl transition-all cursor-pointer relative overflow-hidden text-base sm:text-lg font-semibold ";
                
                if (isSelected) {
                  btnClass += "bg-[#004ac6] text-white shadow-lg shadow-[#004ac6]/30 font-bold scale-105";
                } else if (isHoliday) {
                  btnClass += "bg-[#ba1a1a]/5 text-[#ba1a1a]/50 hover:bg-[#ba1a1a]/10";
                } else if (isPast) {
                  btnClass += "text-[#434655]/40 hover:bg-[#f2f4f6]/50";
                } else {
                  btnClass += "bg-white/50 text-[#191c1e] hover:bg-white hover:shadow-md border border-transparent hover:border-[#c3c6d7]/30";
                }

                return (
                  <div key={day} onClick={() => !isHoliday && setSelectedDate(day)} className={btnClass}>
                    {isSelected && <div className="absolute inset-0 bg-white/20"></div>}
                    <span className="relative z-10">{day}</span>
                    {day === 12 && !isSelected && <span className="absolute bottom-2 w-1.5 h-1.5 bg-[#006229] rounded-full"></span>}
                    {isHoliday && <span className="absolute bottom-1 text-[8px] uppercase tracking-wider font-bold text-[#ba1a1a]/60">Libur</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mascot Help Banner */}
          <div className="glass-panel rounded-3xl p-6 flex items-center justify-between bg-gradient-to-r from-[#dbe1ff]/50 to-transparent overflow-hidden border border-[#b4c5ff]/50 relative">
            <div className="max-w-[70%] z-10">
              <h3 className="text-lg font-bold text-[#004ac6] mb-1 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Butuh Bantuan Penjadwalan?
              </h3>
              <p className="text-sm text-[#434655]">Hubungi konsultan kami jika Anda kesulitan menemukan slot waktu yang pas untuk anak Anda.</p>
              <Button size="sm" className="mt-3 bg-[#fd761a] hover:bg-[#e66a17] text-white rounded-full">
                Hubungi Konsultan
              </Button>
            </div>
            <div className="absolute -right-6 -bottom-6 w-40 opacity-90 z-0 mix-blend-multiply">
              <img alt="Digikidz Mascot" src={mascotChild} className="w-full h-auto drop-shadow-2xl" />
            </div>
          </div>
        </div>

        {/* Right: Time Picker */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col h-full sticky top-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#191c1e] mb-2">Slot Waktu</h3>
              <div className="flex items-center gap-2 text-[#434655] text-sm font-semibold bg-white px-3 py-1.5 rounded-lg border border-[#c3c6d7]/30 inline-flex">
                <Calendar className="w-4 h-4 text-[#004ac6]" />
                <span>Kamis, {selectedDate || 12} September 2024</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              
              {/* Time Slots */}
              {[
                { time: '09:00', label: 'Pagi', status: 'Tersedia' },
                { time: '10:00', label: 'Pagi', status: 'Terisi' },
                { time: '11:00', label: 'Pagi', status: 'Tersedia' },
                { time: '13:00', label: 'Siang', status: 'Tersedia' },
                { time: '14:00', label: 'Siang', status: 'Tersedia' },
                { time: '15:00', label: 'Sore', status: 'Tersedia' },
              ].map((slot) => {
                const isSelected = selectedTime === slot.time;
                const isFull = slot.status === 'Terisi';
                
                return (
                  <button 
                    key={slot.time}
                    disabled={isFull}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all group ${
                      isFull 
                        ? 'border-[#c3c6d7]/30 bg-[#f2f4f6]/50 opacity-60 cursor-not-allowed' 
                        : isSelected 
                          ? 'border-[#004ac6] bg-white ring-2 ring-[#004ac6]/20 shadow-md transform scale-[1.02]' 
                          : 'border-[#c3c6d7]/40 bg-white/50 hover:bg-white hover:border-[#004ac6]/30 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`text-xl font-black ${isFull ? 'text-[#737686]' : 'text-[#004ac6]'}`}>{slot.time}</span>
                      <div className="text-left">
                        <p className={`text-sm font-bold ${isFull ? 'text-[#737686]' : 'text-[#191c1e]'}`}>{slot.label}</p>
                        <span className={`text-[10px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full ${
                          isFull 
                            ? 'bg-[#e0e3e5] text-[#737686]' 
                            : isSelected
                              ? 'bg-[#004ac6]/10 text-[#004ac6]'
                              : 'bg-[#006229]/10 text-[#006229]'
                        }`}>
                          {isSelected ? 'Terpilih' : slot.status}
                        </span>
                      </div>
                    </div>
                    {isSelected && <span className="material-symbols-outlined text-[#004ac6]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                  </button>
                );
              })}
            </div>

            {/* Confirmation Area */}
            {selectedDate && selectedTime && (
              <div className="mt-6 p-5 bg-gradient-to-br from-[#004ac6] to-[#2563eb] rounded-2xl text-white shadow-xl shadow-[#004ac6]/20 transform transition-all duration-300 translate-y-0">
                <p className="text-[10px] mb-1 opacity-80 uppercase tracking-widest font-bold">Sesi Dipilih</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-black">{selectedTime} - {parseInt(selectedTime.split(':')[0]) + 1}:30</p>
                  <Clock className="w-6 h-6 opacity-80" />
                </div>
                <p className="text-sm mt-3 pt-3 border-t border-white/20 font-medium">Kelas: <span className="font-bold">Robotics Level 1</span></p>
                <button className="w-full mt-4 py-3 bg-white text-[#004ac6] font-bold rounded-xl hover:bg-[#f2f4f6] transition-colors hover:scale-[1.02] active:scale-95 shadow-md">
                  Konfirmasi Jadwal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
