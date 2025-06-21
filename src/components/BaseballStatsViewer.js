import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, Award, Target, Home, BarChart3, Zap, Activity, Clock, Users, Plus, Edit, Trash2, Save, X } from 'lucide-react';

export default function BaseballStatsViewer() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedView, setSelectedView] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [newGame, setNewGame] = useState({
    date: "",
    dateDisplay: "",
    opponent: "",
    atBats: 0,
    plateAppearances: 0,
    runs: 0,
    hits: 0,
    doubles: 0,
    triples: 0,
    homeRuns: 0,
    totalBases: 0,
    rbis: 0,
    walks: 0,
    steals: 0,
    strikeouts: 0,
    doublePlay: 0,
    flyouts: 0,
    groundouts: 0,
    errors: 0,
    caughtStealing: 0,
    foulOuts: 0,
    catcherInterference: 0,
    leftField: 0,
    centerField: 0,
    rightField: 0,
    pitches: ""
  });
  
  // 데이터 자동 백업 상태
  const [lastBackupTime, setLastBackupTime] = useState(null);

  useEffect(() => {
    // localStorage에서 기존 데이터 자동 복구 시도
    try {
      const savedData = localStorage.getItem('baseballStatsData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setData(parsedData);
          console.log(`✅ ${parsedData.length}경기 데이터를 성공적으로 복구했습니다!`);
          
          // 마지막 백업 시간도 복구
          const lastBackup = localStorage.getItem('lastBackupTime');
          if (lastBackup) {
            setLastBackupTime(new Date(lastBackup));
          }
        }
      }
    } catch (error) {
      console.error('데이터 복구 중 오류:', error);
    }
  }, []);

  // 데이터가 변경될 때마다 다중 백업 시스템 가동
  useEffect(() => {
    if (data.length > 0) {
      try {
        // 1. localStorage 메인 백업
        localStorage.setItem('baseballStatsData', JSON.stringify(data));
        
        // 2. localStorage 보조 백업 (다른 키로 중복 저장)
        localStorage.setItem('baseballStatsData_backup1', JSON.stringify(data));
        localStorage.setItem('baseballStatsData_backup2', JSON.stringify(data));
        
        // 3. 백업 시간 저장
        const now = new Date();
        localStorage.setItem('lastBackupTime', now.toISOString());
        setLastBackupTime(now);
        
        // 4. 데이터 무결성 검증
        const saved = localStorage.getItem('baseballStatsData');
        const parsed = JSON.parse(saved);
        if (parsed.length !== data.length) {
          console.error('⚠️ 백업 데이터 불일치 감지!');
          // 재시도
          localStorage.setItem('baseballStatsData', JSON.stringify(data));
        }
        
        console.log(`💾 ${data.length}경기 데이터가 3중 백업되었습니다. (${now.toLocaleTimeString()})`);
      } catch (error) {
        console.error('자동 저장 실패:', error);
        alert('⚠️ 데이터 저장에 실패했습니다! 브라우저 저장소를 확인해주세요.');
      }
    }
  }, [data]);

  // 페이지 종료 전 최종 백업
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (data.length > 0) {
        try {
          localStorage.setItem('baseballStatsData_emergency', JSON.stringify(data));
          console.log('🚨 비상 백업 완료');
        } catch (error) {
          console.error('비상 백업 실패:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [data]);
  
  // 통계 계산
  const calculateStats = () => {
    if (data.length === 0) {
      return {
        totalStats: {
          games: 0,
          atBats: 0,
          plateAppearances: 0,
          runs: 0,
          hits: 0,
          doubles: 0,
          triples: 0,
          homeRuns: 0,
          totalBases: 0,
          rbis: 0,
          walks: 0,
          steals: 0,
          strikeouts: 0,
          doublePlay: 0,
          flyouts: 0,
          groundouts: 0,
          errors: 0,
          caughtStealing: 0,
          foulOuts: 0,
          catcherInterference: 0,
          leftField: 0,
          centerField: 0,
          rightField: 0
        },
        sabermetrics: {
          battingAverage: 0,
          onBasePercentage: 0,
          sluggingPercentage: 0,
          ops: 0,
          leftFieldPct: 0,
          centerFieldPct: 0,
          rightFieldPct: 0
        }
      };
    }

    const totalStats = data.reduce((acc, game) => {
      Object.keys(acc).forEach(key => {
        if (key !== 'games' && typeof game[key] === 'number') {
          acc[key] += game[key];
        }
      });
      return acc;
    }, {
      games: data.length,
      atBats: 0,
      plateAppearances: 0,
      runs: 0,
      hits: 0,
      doubles: 0,
      triples: 0,
      homeRuns: 0,
      totalBases: 0,
      rbis: 0,
      walks: 0,
      steals: 0,
      strikeouts: 0,
      doublePlay: 0,
      flyouts: 0,
      groundouts: 0,
      errors: 0,
      caughtStealing: 0,
      foulOuts: 0,
      catcherInterference: 0,
      leftField: 0,
      centerField: 0,
      rightField: 0
    });

    const battingAverage = totalStats.atBats > 0 ? totalStats.hits / totalStats.atBats : 0;
    const onBasePercentage = totalStats.plateAppearances > 0 ? (totalStats.hits + totalStats.walks) / totalStats.plateAppearances : 0;
    const sluggingPercentage = totalStats.atBats > 0 ? totalStats.totalBases / totalStats.atBats : 0;
    const totalFielding = totalStats.leftField + totalStats.centerField + totalStats.rightField;

    const sabermetrics = {
      battingAverage,
      onBasePercentage,
      sluggingPercentage,
      ops: onBasePercentage + sluggingPercentage,
      leftFieldPct: totalFielding > 0 ? Math.round((totalStats.leftField / totalFielding) * 100) : 0,
      centerFieldPct: totalFielding > 0 ? Math.round((totalStats.centerField / totalFielding) * 100) : 0,
      rightFieldPct: totalFielding > 0 ? Math.round((totalStats.rightField / totalFielding) * 100) : 0
    };

    return { totalStats, sabermetrics };
  };

  const { totalStats, sabermetrics } = calculateStats();

  // 월별 통계 계산
  const calculateMonthlyStats = () => {
    const monthlyData = {};
    data.forEach(game => {
      const month = game.date.substring(5, 7);
      const monthName = `${parseInt(month)}월`;
      if (!monthlyData[monthName]) {
        monthlyData[monthName] = { games: 0, hits: 0, atBats: 0, homeRuns: 0, rbis: 0 };
      }
      monthlyData[monthName].games++;
      monthlyData[monthName].hits += game.hits;
      monthlyData[monthName].atBats += game.atBats;
      monthlyData[monthName].homeRuns += game.homeRuns;
      monthlyData[monthName].rbis += game.rbis;
    });

    return Object.entries(monthlyData).map(([month, stats]) => ({
      month,
      games: stats.games,
      avg: stats.atBats > 0 ? stats.hits / stats.atBats : 0,
      hits: stats.hits,
      hrs: stats.homeRuns,
      rbis: stats.rbis
    }));
  };

  // 상대팀별 통계 계산
  const calculateOpponentStats = () => {
    const opponentData = {};
    data.forEach(game => {
      const team = game.opponent.split('(')[0];
      if (!opponentData[team]) {
        opponentData[team] = { games: 0, hits: 0, atBats: 0, homeRuns: 0 };
      }
      opponentData[team].games++;
      opponentData[team].hits += game.hits;
      opponentData[team].atBats += game.atBats;
      opponentData[team].homeRuns += game.homeRuns;
    });

    return Object.entries(opponentData).map(([team, stats]) => ({
      team,
      games: stats.games,
      avg: stats.atBats > 0 ? stats.hits / stats.atBats : 0,
      hits: stats.hits,
      hrs: stats.homeRuns
    })).sort((a, b) => b.games - a.games);
  };

  const monthlyStats = calculateMonthlyStats();
  const opponentStats = calculateOpponentStats();

  // 연속 기록 계산
  const calculateStreaks = () => {
    if (data.length === 0) return { hotStreak: 0, onBaseStreak: 0 };
    
    let maxHitStreak = 0;
    let currentHitStreak = 0;
    let maxOnBaseStreak = 0;
    let currentOnBaseStreak = 0;
    
    // 날짜순으로 정렬된 데이터를 기준으로 계산
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedData.forEach(game => {
      // 안타 연속 기록
      if (game.hits > 0) {
        currentHitStreak++;
        maxHitStreak = Math.max(maxHitStreak, currentHitStreak);
      } else if (game.atBats > 0) {
        currentHitStreak = 0;
      }
      
      // 출루 연속 기록 (안타 + 4사구)
      if (game.hits > 0 || game.walks > 0) {
        currentOnBaseStreak++;
        maxOnBaseStreak = Math.max(maxOnBaseStreak, currentOnBaseStreak);
      } else if (game.atBats > 0 || game.walks > 0) {
        currentOnBaseStreak = 0;
      }
    });
    
    return { hotStreak: maxHitStreak, onBaseStreak: maxOnBaseStreak };
  };

  // 홈/원정 타율 계산
  const calculateHomeAwayStats = () => {
    const homeGames = data.filter(game => game.opponent.includes('(고양)'));
    const awayGames = data.filter(game => !game.opponent.includes('(고양)'));
    
    const homeStats = homeGames.reduce((acc, game) => ({
      hits: acc.hits + game.hits,
      atBats: acc.atBats + game.atBats
    }), { hits: 0, atBats: 0 });
    
    const awayStats = awayGames.reduce((acc, game) => ({
      hits: acc.hits + game.hits,
      atBats: acc.atBats + game.atBats
    }), { hits: 0, atBats: 0 });
    
    return {
      homeAverage: homeStats.atBats > 0 ? homeStats.hits / homeStats.atBats : 0,
      awayAverage: awayStats.atBats > 0 ? awayStats.hits / awayStats.atBats : 0,
      homeGames: homeGames.length,
      awayGames: awayGames.length
    };
  };

  // 최근 상승세 계산 (최근 5경기 vs 전체 평균)
  const calculateMomentum = () => {
    if (data.length === 0) return 0;
    
    const recentGames = data.slice(0, Math.min(5, data.length));
    const recentStats = recentGames.reduce((acc, game) => ({
      hits: acc.hits + game.hits,
      atBats: acc.atBats + game.atBats
    }), { hits: 0, atBats: 0 });
    
    const recentAvg = recentStats.atBats > 0 ? recentStats.hits / recentStats.atBats : 0;
    const overallAvg = sabermetrics.battingAverage;
    
    if (overallAvg === 0) return 50;
    
    const momentum = Math.min(100, Math.max(0, Math.round(50 + (recentAvg - overallAvg) * 200)));
    return momentum;
  };

  // 타석당 평균 투구수 계산
  const calculateAvgPitches = () => {
    if (data.length === 0) return 0;
    
    let totalPitches = 0;
    let totalPlateAppearances = 0;
    
    data.forEach(game => {
      if (game.pitches && game.pitches.trim()) {
        const pitches = game.pitches.split('-').map(p => parseInt(p.replace(/[^0-9]/g, ''))).filter(p => !isNaN(p));
        totalPitches += pitches.reduce((sum, p) => sum + p, 0);
        totalPlateAppearances += pitches.length;
      }
    });
    
    return totalPlateAppearances > 0 ? totalPitches / totalPlateAppearances : 0;
  };

  const streaks = calculateStreaks();
  const homeAwayStats = calculateHomeAwayStats();
  const momentum = calculateMomentum();
  const avgPitches = calculateAvgPitches();

  // 고급 분석 지표
  const advancedStats = {
    productivityIndex: totalStats.games > 0 ? (totalStats.runs + totalStats.rbis) / totalStats.games : 0,
    consistency: totalStats.games > 0 ? Math.min(100, Math.round((totalStats.hits / totalStats.games) * 100)) : 0,
    momentumScore: momentum,
    averagePitchesPerPlateApp: avgPitches,
    powerFactor: totalStats.atBats > 0 ? totalStats.totalBases / totalStats.atBats : 0,
    hotStreak: streaks.hotStreak,
    onBaseStreak: streaks.onBaseStreak,
    homeAverage: homeAwayStats.homeAverage,
    awayAverage: homeAwayStats.awayAverage,
    homeGames: homeAwayStats.homeGames,
    awayGames: homeAwayStats.awayGames
  };

  const handleAddGame = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const displayDate = `${today.getFullYear()}. ${String(today.getMonth() + 1).padStart(2, '0')}. ${String(today.getDate()).padStart(2, '0')}.`;
    
    setNewGame({
      date: formattedDate,
      dateDisplay: displayDate,
      opponent: "",
      atBats: 0,
      plateAppearances: 0,
      runs: 0,
      hits: 0,
      doubles: 0,
      triples: 0,
      homeRuns: 0,
      totalBases: 0,
      rbis: 0,
      walks: 0,
      steals: 0,
      strikeouts: 0,
      doublePlay: 0,
      flyouts: 0,
      groundouts: 0,
      errors: 0,
      caughtStealing: 0,
      foulOuts: 0,
      catcherInterference: 0,
      leftField: 0,
      centerField: 0,
      rightField: 0,
      pitches: ""
    });
    setEditingGame(null);
    setDeleteChecked(false);
    setIsEditing(true);
  };

  const handleSaveGame = () => {
    if (editingGame !== null) {
      const updatedData = [...data];
      updatedData[editingGame] = { ...newGame };
      setData(updatedData.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setEditingGame(null);
    } else {
      const updatedData = [...data, { ...newGame }];
      setData(updatedData.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }
    setIsEditing(false);
    setEditingGame(null);
    setDeleteChecked(false);
    setNewGame({
      date: "",
      dateDisplay: "",
      opponent: "",
      atBats: 0,
      plateAppearances: 0,
      runs: 0,
      hits: 0,
      doubles: 0,
      triples: 0,
      homeRuns: 0,
      totalBases: 0,
      rbis: 0,
      walks: 0,
      steals: 0,
      strikeouts: 0,
      doublePlay: 0,
      flyouts: 0,
      groundouts: 0,
      errors: 0,
      caughtStealing: 0,
      foulOuts: 0,
      catcherInterference: 0,
      leftField: 0,
      centerField: 0,
      rightField: 0,
      pitches: ""
    });
  };

  // 비밀번호 입력 상태 추가
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');

  const handleEditGame = (index) => {
    setEditingIndex(index);
    setPasswordInput('');
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === '0421') {
      setNewGame({ ...data[editingIndex] });
      setEditingGame(editingIndex);
      setDeleteChecked(false);
      setIsEditing(true);
      setShowPasswordModal(false);
      setPasswordInput('');
      setEditingIndex(null);
    } else {
      alert('❌ 비밀번호가 틀렸습니다.');
      setPasswordInput('');
    }
  };

  // 삭제 체크박스 상태 추가
  const [deleteChecked, setDeleteChecked] = useState(false);

  const handleInputChange = (field, value) => {
    setNewGame(prev => ({
      ...prev,
      [field]: field === 'opponent' || field === 'pitches' || field === 'date' || field === 'dateDisplay' ? value : (value === '' ? 0 : Number(value))
    }));
  };

  const handleDateChange = (dateValue) => {
    const date = new Date(dateValue);
    const displayDate = `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}.`;
    setNewGame(prev => ({
      ...prev,
      date: dateValue,
      dateDisplay: displayDate
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">박성빈 선수 기록을 불러오는 중...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">박성빈</h1>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-500">2025시즌 전체 기록 ({data.length}경기)</p>
                    {lastBackupTime && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                        💾 {lastBackupTime.toLocaleTimeString()} 백업됨
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={handleAddGame}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                경기 추가
              </button>
            </div>
            
            {/* 네비게이션 탭 */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setSelectedView('overview')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedView === 'overview' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                개요
              </button>
              <button
                onClick={() => setSelectedView('trends')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedView === 'trends' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                트렌드 분석
              </button>
              <button
                onClick={() => setSelectedView('advanced')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedView === 'advanced' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                고급 분석
              </button>
              <button
                onClick={() => setSelectedView('detailed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedView === 'detailed' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                상세 기록
              </button>
            </div>
          </div>
        </div>

        {/* 비밀번호 입력 모달 */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-bold text-gray-900 mb-4">🔒 수정 권한 확인</h2>
              <p className="text-sm text-gray-600 mb-4">
                경기 기록을 수정하려면 비밀번호를 입력하세요.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handlePasswordSubmit();
                    }
                  }}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordInput('');
                    setEditingIndex(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 경기 추가/수정 모달 */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-2 overflow-y-auto">
            <div className="bg-white rounded-xl my-4 w-full max-w-3xl">
              {/* 고정 헤더 */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-xl sticky top-0">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingGame !== null ? '경기 기록 수정' : '새 경기 추가'}
                </h2>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingGame(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* 스크롤 가능한 내용 */}
              <div className="p-4 space-y-4">
                {/* 기본 정보 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                    <input
                      type="date"
                      value={newGame.date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">상대팀</label>
                    <input
                      type="text"
                      value={newGame.opponent}
                      onChange={(e) => handleInputChange('opponent', e.target.value)}
                      placeholder="예: SSG(강화)"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">투구수</label>
                    <input
                      type="text"
                      value={newGame.pitches}
                      onChange={(e) => handleInputChange('pitches', e.target.value)}
                      placeholder="예: 3-2-2-3"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* 타격 기록 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 bg-blue-50 px-3 py-2 rounded-lg">📊 타격 기록</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { key: 'atBats', label: '타수' },
                      { key: 'plateAppearances', label: '타석' },
                      { key: 'hits', label: '안타' },
                      { key: 'doubles', label: '2루타' },
                      { key: 'triples', label: '3루타' },
                      { key: 'homeRuns', label: '홈런' },
                      { key: 'totalBases', label: '총루타' },
                      { key: 'runs', label: '득점' },
                      { key: 'rbis', label: '타점' },
                      { key: 'walks', label: '4사구' },
                      { key: 'steals', label: '도루' },
                      { key: 'strikeouts', label: '삼진' }
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                        <input
                          type="number"
                          min="0"
                          value={newGame[key] === 0 ? '' : newGame[key]}
                          placeholder="0"
                          onChange={(e) => handleInputChange(key, e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 아웃 기록 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 bg-red-50 px-3 py-2 rounded-lg">⚾ 아웃 기록</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'doublePlay', label: '병살' },
                      { key: 'flyouts', label: '플라이아웃' },
                      { key: 'groundouts', label: '땅볼아웃' },
                      { key: 'catcherInterference', label: '포일' },
                      { key: 'errors', label: '실책' },
                      { key: 'caughtStealing', label: '도루저지' }
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                        <input
                          type="number"
                          min="0"
                          value={newGame[key] === 0 ? '' : newGame[key]}
                          placeholder="0"
                          onChange={(e) => handleInputChange(key, e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 타구 방향 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 bg-green-50 px-3 py-2 rounded-lg">🎯 타구 방향</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'leftField', label: '좌익수' },
                      { key: 'centerField', label: '중견수' },
                      { key: 'rightField', label: '우익수' }
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                        <input
                          type="number"
                          min="0"
                          value={newGame[key] === 0 ? '' : newGame[key]}
                          placeholder="0"
                          onChange={(e) => handleInputChange(key, e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 고정 푸터 */}
              <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingGame(null);
                    setDeleteChecked(false);
                    setNewGame({
                      date: "",
                      dateDisplay: "",
                      opponent: "",
                      atBats: 0,
                      plateAppearances: 0,
                      runs: 0,
                      hits: 0,
                      doubles: 0,
                      triples: 0,
                      homeRuns: 0,
                      totalBases: 0,
                      rbis: 0,
                      walks: 0,
                      steals: 0,
                      strikeouts: 0,
                      doublePlay: 0,
                      flyouts: 0,
                      groundouts: 0,
                      errors: 0,
                      caughtStealing: 0,
                      foulOuts: 0,
                      catcherInterference: 0,
                      leftField: 0,
                      centerField: 0,
                      rightField: 0,
                      pitches: ""
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <X className="w-4 h-4" />
                    취소
                  </button>
                  
                  {editingGame !== null && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700 mb-3">
                        ⚠️ 이 경기를 삭제하시겠습니까?<br/>
                        <strong>{data[editingGame]?.dateDisplay} {data[editingGame]?.opponent}</strong>
                      </p>
                      
                      {!deleteChecked ? (
                        <button
                          onClick={() => setDeleteChecked(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          삭제
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm font-bold text-red-800">⚠️ 정말로 삭제하시겠습니까?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setDeleteChecked(false)}
                              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <X className="w-4 h-4" />
                              취소
                            </button>
                            <button
                              onClick={() => {
                                const newData = data.filter((_, i) => i !== editingGame);
                                setData(newData);
                                
                                // localStorage에서도 삭제 (3중 백업 모두)
                                if (newData.length === 0) {
                                  localStorage.removeItem('baseballStatsData');
                                  localStorage.removeItem('baseballStatsData_backup1');
                                  localStorage.removeItem('baseballStatsData_backup2');
                                  localStorage.removeItem('baseballStatsData_emergency');
                                } else {
                                  localStorage.setItem('baseballStatsData', JSON.stringify(newData));
                                  localStorage.setItem('baseballStatsData_backup1', JSON.stringify(newData));
                                  localStorage.setItem('baseballStatsData_backup2', JSON.stringify(newData));
                                }
                                
                                setIsEditing(false);
                                setEditingGame(null);
                                setDeleteChecked(false);
                                alert('✅ 경기가 삭제되었습니다!');
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              확실히 삭제
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleSaveGame}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  저장
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'overview' && (
          <>
            {/* 주요 통계 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">경기수</p>
                    <p className="text-xl font-bold text-gray-900">{totalStats.games}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">타율</p>
                    <p className="text-xl font-bold text-gray-900">{sabermetrics.battingAverage.toFixed(3)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">안타</p>
                    <p className="text-xl font-bold text-gray-900">{totalStats.hits}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">홈런</p>
                    <p className="text-xl font-bold text-gray-900">{totalStats.homeRuns}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">타점</p>
                    <p className="text-xl font-bold text-gray-900">{totalStats.rbis}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">OPS</p>
                    <p className="text-xl font-bold text-gray-900">{sabermetrics.ops.toFixed(3)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 세이버메트릭스 & 총합 통계 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">세이버메트릭스 & 총합 통계</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600">출루율</p>
                    <p className="text-lg font-bold text-blue-600">{sabermetrics.onBasePercentage.toFixed(3)}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-600">장타율</p>
                    <p className="text-lg font-bold text-green-600">{sabermetrics.sluggingPercentage.toFixed(3)}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">총 타석</p>
                    <p className="text-lg font-bold text-gray-600">{totalStats.atBats}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">총 루타</p>
                    <p className="text-lg font-bold text-gray-600">{totalStats.totalBases}</p>
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-md font-bold text-gray-900 mb-4">타구 분포</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-xs text-gray-600">좌익수 방향</p>
                      <p className="text-2xl font-bold text-orange-600">{sabermetrics.leftFieldPct}%</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-xs text-gray-600">중견수 방향</p>
                      <p className="text-2xl font-bold text-purple-600">{sabermetrics.centerFieldPct}%</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-xs text-gray-600">우익수 방향</p>
                      <p className="text-2xl font-bold text-red-600">{sabermetrics.rightFieldPct}%</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">총 득점</p>
                  <p className="text-lg font-bold text-gray-600">{totalStats.runs}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">4사구</p>
                  <p className="text-lg font-bold text-gray-600">{totalStats.walks}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">플라이아웃</p>
                  <p className="text-lg font-bold text-gray-600">{totalStats.flyouts}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">땅볼아웃</p>
                  <p className="text-lg font-bold text-gray-600">{totalStats.groundouts}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedView === 'trends' && monthlyStats.length > 0 && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">월별 성적 트렌드</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {monthlyStats.map((month) => (
                  <div key={month.month} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="text-lg font-bold text-blue-900 mb-2">{month.month}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">경기</span>
                        <span className="font-medium">{month.games}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">타율</span>
                        <span className="font-bold text-blue-700">{month.avg.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">안타</span>
                        <span className="font-medium">{month.hits}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">홈런</span>
                        <span className="font-medium">{month.hrs}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>트렌드 분석:</strong> {monthlyStats.length > 0 ? 
                    (() => {
                      // 가장 최근 월 찾기
                      const latestMonth = monthlyStats.sort((a, b) => {
                        const monthA = parseInt(a.month.replace('월', ''));
                        const monthB = parseInt(b.month.replace('월', ''));
                        return monthB - monthA;
                      })[0];
                      
                      return `최근 ${latestMonth.month} 타율 ${latestMonth.avg.toFixed(3)} - ${latestMonth.avg >= 0.300 ? '좋은 성적을 유지하고 있습니다' : latestMonth.avg >= 0.250 ? '안정적인 성적을 보이고 있습니다' : '개선의 여지가 있습니다'}`;
                    })()
                    : '데이터가 없습니다.'
                  }
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">상대팀별 성적</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {opponentStats.map((team) => (
                  <div key={team.team} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-gray-900">{team.team}</h4>
                      <span className="text-sm text-gray-500">{team.games}경기</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">타율</span>
                      <span className={`font-bold ${team.avg >= 0.300 ? 'text-green-600' : team.avg >= 0.200 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {team.avg.toFixed(3)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">안타: {team.hits}</span>
                      <span className="text-gray-600">홈런: {team.hrs}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'trends' && monthlyStats.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">트렌드 데이터가 없습니다</h3>
              <p className="text-gray-500">경기 기록을 추가하면 트렌드 분석을 볼 수 있습니다.</p>
            </div>
          </div>
        )}

        {selectedView === 'advanced' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">고급 분석 지표</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">기여도</p>
                  <p className="text-xl font-bold text-purple-700">{advancedStats.productivityIndex.toFixed(2)}</p>
                  <p className="text-xs text-purple-600 mt-1">경기당 득점+타점</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">기복</p>
                  <p className="text-xl font-bold text-green-700">{advancedStats.consistency}%</p>
                  <p className="text-xs text-green-600 mt-1">안정성 지수</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">최근 상승세</p>
                  <p className="text-xl font-bold text-orange-700">{advancedStats.momentumScore}</p>
                  <p className="text-xs text-orange-600 mt-1">모멘텀 점수</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">타석당 투구수</p>
                  <p className="text-xl font-bold text-blue-700">{advancedStats.averagePitchesPerPlateApp.toFixed(1)}</p>
                  <p className="text-xs text-blue-600 mt-1">평균 볼카운트</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">연속 기록 & 특별 통계</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                  <h4 className="text-lg font-bold text-green-800 mb-3">🔥 연속 기록</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-green-700">최장 연속 안타</span>
                      <span className="font-bold text-green-800">{advancedStats.hotStreak}경기</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">연속 출루 기록</span>
                      <span className="font-bold text-green-800">{advancedStats.onBaseStreak}경기</span>
                    </div>
                  </div>
                </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                    <h4 className="text-lg font-bold text-blue-800 mb-3">🏟️ 홈/원정 기록</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-blue-700">홈 경기 <span className="text-xs text-blue-500">({advancedStats.homeGames}경기)</span></span>
                        <span className="font-bold text-blue-800">{advancedStats.homeAverage.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">원정 경기 <span className="text-xs text-blue-500">({advancedStats.awayGames}경기)</span></span>
                        <span className="font-bold text-blue-800">{advancedStats.awayAverage.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'detailed' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">경기별 상세 기록</h2>
              <p className="text-gray-500 mt-1">총 {data.length}경기 - 모든 세부 기록 포함</p>
            </div>
            
            {data.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">경기 기록이 없습니다</h3>
                <p className="text-gray-500 mb-4">새로운 경기 기록을 추가해보세요.</p>
                <button
                  onClick={handleAddGame}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  첫 경기 추가하기
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-2 text-left font-medium text-gray-500">액션</th>
                      <th className="px-2 py-2 text-left font-medium text-gray-500">날짜</th>
                      <th className="px-2 py-2 text-left font-medium text-gray-500">상대팀</th>
                      <th className="px-1 py-2 text-center font-medium text-gray-500">타석</th>
                      <th className="px-1 py-2 text-center font-medium text-gray-500">타수</th>
                      <th className="px-1 py-2 text-center font-medium text-gray-500">안타</th>
                      <th className="px-1 py-2 text-center font-medium text-gray-500">2B</th>
                      <th className="px-1 py-2 text-center font-medium text-gray-500">3B</th>
                      <th className="px-1 py-2 text-center font-medium text-gray-500">HR</th>
                      <th className="px-1 py-2 text-center font-medium text-gray-500">득점</th>
                      <th className="px-1 py-2 text-center font-medium text-gray-500">타점</th>
                      <th className="px-1 py-2 text-center font-medium text-gray-500">4사구</th>
                      <th className="px-1 py-2 text-center font-medium text-gray-500">삼진</th>
                      <th className="px-1 py-2 text-center font-medium text-gray-500">도루</th>
                      <th className="px-1 py-2 text-center font-medium text-gray-500">병살</th>
                      <th className="px-1 py-2 text-center font-medium text-gray-500">플라이</th>
                      <th className="px-1 py-2 text-center font-medium text-gray-500">땅볼</th>
                      <th className="px-1 py-2 text-center font-medium text-gray-500">실책</th>
                      <th className="px-1 py-2 text-center font-medium text-gray-500">도루저지</th>
                      <th className="px-1 py-2 text-center font-medium text-gray-500">포일</th>
                      <th className="px-1 py-2 text-center font-medium text-gray-500">좌</th>
                      <th className="px-1 py-2 text-center font-medium text-gray-500">중</th>
                      <th className="px-1 py-2 text-center font-medium text-gray-500">우</th>
                      <th className="px-1 py-2 text-center font-medium text-gray-500">투구수</th>
                    </tr>
                    {/* 총계 행 */}
                    {data.length > 0 && (
                      <tr className="bg-blue-50 border-b-2 border-blue-200">
                        <td className="px-2 py-3"></td>
                        <td className="px-2 py-3 font-bold text-blue-900">2025 합계</td>
                        <td className="px-2 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-200 text-blue-900">
                            {totalStats.games}경기
                          </span>
                        </td>
                        <td className="px-1 py-3 text-center font-bold text-blue-900">{totalStats.atBats}</td>
                        <td className="px-1 py-3 text-center font-bold text-blue-900">{totalStats.plateAppearances}</td>
                        <td className="px-1 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-green-200 text-green-900">
                            {totalStats.hits}
                          </span>
                        </td>
                        <td className="px-1 py-3 text-center font-bold text-blue-900">{totalStats.doubles}</td>
                        <td className="px-1 py-3 text-center font-bold text-blue-900">{totalStats.triples}</td>
                        <td className="px-1 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-yellow-200 text-yellow-900">
                            {totalStats.homeRuns}
                          </span>
                        </td>
                        <td className="px-1 py-3 text-center font-bold text-blue-900">{totalStats.runs}</td>
                        <td className="px-1 py-3 text-center font-bold text-blue-900">{totalStats.rbis}</td>
                        <td className="px-1 py-3 text-center font-bold text-blue-900">{totalStats.walks}</td>
                        <td className="px-1 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-red-200 text-red-900">
                            {totalStats.strikeouts}
                          </span>
                        </td>
                        <td className="px-1 py-3 text-center font-bold text-blue-900">{totalStats.steals}</td>
                        <td className="px-1 py-3 text-center font-bold text-blue-900">{totalStats.doublePlay}</td>
                        <td className="px-1 py-3 text-center font-bold text-blue-900">{totalStats.flyouts}</td>
                        <td className="px-1 py-3 text-center font-bold text-blue-900">{totalStats.groundouts}</td>
                        <td className="px-1 py-3 text-center font-bold text-blue-900">{totalStats.errors}</td>
                        <td className="px-1 py-3 text-center font-bold text-blue-900">{totalStats.caughtStealing}</td>
                        <td className="px-1 py-3 text-center font-bold text-blue-900">{totalStats.catcherInterference}</td>
                        <td className="px-1 py-3 text-center font-bold text-blue-900">{totalStats.leftField}</td>
                        <td className="px-1 py-3 text-center font-bold text-blue-900">{totalStats.centerField}</td>
                        <td className="px-1 py-3 text-center font-bold text-blue-900">{totalStats.rightField}</td>
                        <td className="px-1 py-3 text-center font-bold text-blue-900">-</td>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.map((game, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-2 py-2">
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditGame(index)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              title="수정"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-gray-900">{game.dateDisplay}</td>
                        <td className="px-2 py-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            game.opponent.includes('(고양)') 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {game.opponent}
                            {game.opponent.includes('(고양)') && ' 🏠'}
                          </span>
                        </td>
                        <td className="px-1 py-2 text-center text-gray-900">{game.atBats}</td>
                        <td className="px-1 py-2 text-center text-gray-900">{game.plateAppearances}</td>
                        <td className="px-1 py-2 text-center">
                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                            game.hits > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {game.hits}
                          </span>
                        </td>
                        <td className="px-1 py-2 text-center text-gray-900">{game.doubles || '-'}</td>
                        <td className="px-1 py-2 text-center text-gray-900">{game.triples || '-'}</td>
                        <td className="px-1 py-2 text-center">
                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                            game.homeRuns > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {game.homeRuns || '-'}
                          </span>
                        </td>
                        <td className="px-1 py-2 text-center text-gray-900">{game.runs || '-'}</td>
                        <td className="px-1 py-2 text-center text-gray-900">{game.rbis || '-'}</td>
                        <td className="px-1 py-2 text-center text-gray-900">{game.walks || '-'}</td>
                        <td className="px-1 py-2 text-center">
                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                            game.strikeouts > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {game.strikeouts || '-'}
                          </span>
                        </td>
                        <td className="px-1 py-2 text-center text-gray-900">{game.steals || '-'}</td>
                        <td className="px-1 py-2 text-center text-gray-900">{game.doublePlay || '-'}</td>
                        <td className="px-1 py-2 text-center text-gray-900">{game.flyouts || '-'}</td>
                        <td className="px-1 py-2 text-center text-gray-900">{game.groundouts || '-'}</td>
                        <td className="px-1 py-2 text-center text-gray-900">{game.errors || '-'}</td>
                        <td className="px-1 py-2 text-center text-gray-900">{game.caughtStealing || '-'}</td>
                        <td className="px-1 py-2 text-center text-gray-900">{game.catcherInterference || '-'}</td>
                        <td className="px-1 py-2 text-center text-gray-900">{game.leftField || '-'}</td>
                        <td className="px-1 py-2 text-center text-gray-900">{game.centerField || '-'}</td>
                        <td className="px-1 py-2 text-center text-gray-900">{game.rightField || '-'}</td>
                        <td className="px-1 py-2 text-center text-gray-900 font-mono text-xs">
                          {game.pitches || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
