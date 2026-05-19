import React, { useMemo } from 'react';

const VIDEOS = {
  keystone: 'https://res.cloudinary.com/dy0k9rsy4/video/upload/v1779204048/KEYSTONE_vfyijo.mp4',
  crossover: 'https://res.cloudinary.com/dy0k9rsy4/video/upload/v1779202778/CROSSOVER_fhxpxs.mp4',
  t568a:    'https://res.cloudinary.com/dy0k9rsy4/video/upload/v1779203587/T568A_jrwyvy.mp4',
  t568b:    'https://res.cloudinary.com/dy0k9rsy4/video/upload/v1779204353/T568B_srhgh6.mp4',
};

export default function VideoPlayer({ state }) {
  const { activeStandard, cableType, activeMode, hardwareType } = state;

  const currentVideo = useMemo(() => {
    if (hardwareType === 'keystone') {
      return { src: VIDEOS.keystone, title: 'Keystone Jack Punch-Down' };
    }
    if (cableType === 'crossover') {
      return { src: VIDEOS.crossover, title: 'Crossover Link Wiring' };
    }
    if (activeStandard === 'T568A') {
      return { src: VIDEOS.t568a, title: 'T568A Termination Guide' };
    }
    return { src: VIDEOS.t568b, title: 'T568B Termination Guide' };
  }, [activeStandard, cableType, hardwareType]);

  if (activeMode === 'exam') {
    return (
      <div className="bg-slate-100 dark:bg-gray-900 rounded-lg p-4 border border-red-300 dark:border-red-900 shadow-inner flex flex-col items-center justify-center h-48 transition-colors duration-500">
        <div className="w-8 h-8 rounded-full bg-red-200 dark:bg-red-900/50 flex items-center justify-center mb-2 animate-pulse transition-colors">
           <div className="w-3 h-3 bg-red-600 dark:bg-red-500 rounded-full"></div>
        </div>
        <p className="text-red-700 dark:text-red-500 font-bold text-xs tracking-widest uppercase transition-colors">Exam Mode Active</p>
        <p className="text-[10px] font-bold text-slate-500 dark:text-gray-500 mt-1 transition-colors">Video guides are disabled.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-gray-900 rounded-lg p-3 border border-slate-300 dark:border-gray-700 shadow-sm dark:shadow-inner transition-colors duration-500">
      <h2 className="text-[10px] uppercase tracking-widest font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2 transition-colors">
        <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 transition-colors"></span> Live SOP Guide
      </h2>
      
      <div className="relative rounded overflow-hidden border border-slate-300 dark:border-gray-800 bg-slate-200 dark:bg-black aspect-video shadow-inner dark:shadow-none transition-colors">
        <video
          key={currentVideo.src}
          controls
          className="w-full h-full object-cover"
          preload="metadata"
        >
          <source src={currentVideo.src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      <p className="text-xs text-slate-800 dark:text-gray-300 font-black mt-2 truncate transition-colors">{currentVideo.title}</p>
    </div>
  );
}