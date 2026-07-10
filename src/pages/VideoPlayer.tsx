import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Download, FileVideo, List } from 'lucide-react';
import { cn } from '../lib/utils';

interface VideoFile {
  id: number;
  name: string;
  size: string;
  duration: string;
  file: File | null;
  url: string;
}

const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

const isElectron = (window as any).electronAPI !== undefined;

export default function VideoPlayer() {
  const [videoFiles, setVideoFiles] = useState<VideoFile[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showRateMenu, setShowRateMenu] = useState(false);
  const [showFileList, setShowFileList] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newVideos: VideoFile[] = [];
    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        newVideos.push({
          id: Date.now() + index,
          name: file.name,
          size: formatFileSize(file.size),
          duration: '00:00',
          file,
          url,
        });
      }
    });

    setVideoFiles(prev => [...prev, ...newVideos]);
    if (newVideos.length > 0 && !currentVideo) {
      setCurrentVideo(newVideos[0]);
    }
  };

  const handleElectronFileSelect = async () => {
    if (!isElectron || !(window as any).electronAPI) return;
    
    try {
      const filePaths = await (window as any).electronAPI.openVideoDialog();
      if (!filePaths || filePaths.length === 0) return;

      const newVideos: VideoFile[] = [];
      for (let i = 0; i < filePaths.length; i++) {
        const filePath = filePaths[i];
        const url = `file://${filePath}`;
        const fileName = filePath.split(/[\\/]/).pop() || '未知文件';
        
        newVideos.push({
          id: Date.now() + i,
          name: fileName,
          size: '本地文件',
          duration: '00:00',
          file: null,
          url,
        });
      }

      setVideoFiles(prev => [...prev, ...newVideos]);
      if (newVideos.length > 0 && !currentVideo) {
        setCurrentVideo(newVideos[0]);
      }
    } catch (error) {
      console.error('文件选择失败:', error);
    }
  };

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      
      const videoIndex = videoFiles.findIndex(v => v.url === currentVideo?.url);
      if (videoIndex !== -1) {
        const updatedFiles = [...videoFiles];
        updatedFiles[videoIndex] = {
          ...updatedFiles[videoIndex],
          duration: formatDuration(dur),
        };
        setVideoFiles(updatedFiles);
      }
      
      videoRef.current.playbackRate = playbackRate;
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / dur) * 100);
    }
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const time = percent * duration;
    videoRef.current.currentTime = time;
    setProgress(percent * 100);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(event.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
    if (vol > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    videoRef.current.muted = newMuted;
    if (newMuted) {
      videoRef.current.volume = 0;
    } else {
      videoRef.current.volume = volume;
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowRateMenu(false);
  };

  const selectVideo = (video: VideoFile) => {
    setCurrentVideo(video);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  };

  const removeVideo = (id: number) => {
    const video = videoFiles.find(v => v.id === id);
    if (video) {
      URL.revokeObjectURL(video.url);
    }
    const updatedFiles = videoFiles.filter(v => v.id !== id);
    setVideoFiles(updatedFiles);
    if (currentVideo?.id === id) {
      setCurrentVideo(updatedFiles[0] || null);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handlePrevious = () => {
    if (!currentVideo || videoFiles.length === 0) return;
    const currentIndex = videoFiles.findIndex(v => v.id === currentVideo.id);
    if (currentIndex > 0) {
      selectVideo(videoFiles[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (!currentVideo || videoFiles.length === 0) return;
    const currentIndex = videoFiles.findIndex(v => v.id === currentVideo.id);
    if (currentIndex < videoFiles.length - 1) {
      selectVideo(videoFiles[currentIndex + 1]);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    const currentIndex = videoFiles.findIndex(v => v.id === currentVideo?.id);
    if (currentIndex < videoFiles.length - 1) {
      setTimeout(() => selectVideo(videoFiles[currentIndex + 1]), 500);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {showFileList && (
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <List className="w-5 h-5" />
                视频列表
              </h2>
              <span className="text-sm text-gray-400">{videoFiles.length} 个视频</span>
            </div>
            
            <button
              onClick={isElectron ? handleElectronFileSelect : () => fileInputRef.current?.click()}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <FileVideo className="w-5 h-5" />
              添加视频文件
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {videoFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FileVideo className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-center">暂无视频文件</p>
                <p className="text-sm mt-2">点击上方按钮添加视频</p>
              </div>
            ) : (
              <div className="space-y-2">
                {videoFiles.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => selectVideo(video)}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-all",
                      "hover:bg-gray-700",
                      currentVideo?.id === video.id && "bg-blue-600/20 border border-blue-500"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{video.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span>{video.size}</span>
                          <span>{video.duration}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeVideo(video.id);
                        }}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <Download className="w-4 h-4 text-gray-400 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
          <h1 className="text-xl font-semibold">视频播放器</h1>
          <button
            onClick={() => setShowFileList(!showFileList)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 relative bg-black flex items-center justify-center">
          {currentVideo ? (
            <>
              <video
                ref={videoRef}
                src={currentVideo.url}
                onLoadedMetadata={handleVideoLoaded}
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
                onEnded={handleVideoEnded}
                className="max-w-full max-h-full"
              />
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
                <div
                  className="h-1 bg-gray-700 rounded-full cursor-pointer mb-3 group"
                  onClick={handleProgressClick}
                >
                  <div
                    className="h-full bg-blue-500 rounded-full relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePrevious}
                      disabled={!currentVideo || videoFiles.findIndex(v => v.id === currentVideo.id) === 0}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                      </svg>
                    </button>
                    
                    <button
                      onClick={togglePlay}
                      className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </button>
                    
                    <button
                      onClick={handleNext}
                      disabled={!currentVideo || videoFiles.findIndex(v => v.id === currentVideo.id) === videoFiles.length - 1}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                      </svg>
                    </button>
                    
                    <span className="text-sm text-gray-400">
                      {formatDuration(currentTime)} / {formatDuration(duration)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleMute}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {isMuted ? (
                          <VolumeX className="w-5 h-5" />
                        ) : (
                          <Volume2 className="w-5 h-5" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                    
                    <div className="relative">
                      <button
                        onClick={() => setShowRateMenu(!showRateMenu)}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                      >
                        {playbackRate}x
                      </button>
                      
                      {showRateMenu && (
                        <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg border border-gray-700 shadow-xl py-1">
                          {playbackRates.map((rate) => (
                            <button
                              key={rate}
                              onClick={() => handleRateChange(rate)}
                              className={cn(
                                "w-full px-4 py-2 text-sm text-left transition-colors",
                                playbackRate === rate && "bg-blue-600 text-white",
                                playbackRate !== rate && "hover:bg-gray-700"
                              )}
                            >
                              {rate}x
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={handleFullscreen}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500">
              <FileVideo className="w-24 h-24 mb-6 opacity-30" />
              <p className="text-xl">选择一个视频开始播放</p>
              <p className="text-sm mt-2">点击左侧"添加视频文件"按钮</p>
            </div>
          )}
        </div>
        
        {currentVideo && (
          <div className="p-4 bg-gray-800 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{currentVideo.name}</p>
                <p className="text-sm text-gray-400">
                  {currentVideo.size} · {currentVideo.duration}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">播放速度:</span>
                <div className="flex gap-1">
                  {playbackRates.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleRateChange(rate)}
                      className={cn(
                        "px-2 py-1 rounded text-xs transition-colors",
                        playbackRate === rate && "bg-blue-600 text-white",
                        playbackRate !== rate && "bg-gray-700 hover:bg-gray-600"
                      )}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}