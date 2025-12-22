import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LEAGUES, TEAMS, League, getLeagueColor, LEAGUE_STATUS } from '@/data/teams';
import { useFavoriteTeams } from '@/hooks/useFavoriteTeams';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Check, Loader2, Search, X, Construction } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeamSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favoriteTeams, isTeamFavorite, toggleFavoriteTeam, loading } = useFavoriteTeams(user?.id);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeLeague, setActiveLeague] = useState<League>('EPL');
  const [searchQuery, setSearchQuery] = useState('');

  // 현재 리그가 활성화되어 있는지
  const isLeagueActive = LEAGUE_STATUS[activeLeague].active;

  // 검색 필터링된 팀 리스트
  const filteredTeams = useMemo(() => {
    if (!isLeagueActive) return [];
    
    const teams = TEAMS[activeLeague];
    if (!searchQuery.trim()) return teams;
    
    const query = searchQuery.toLowerCase();
    return teams.filter(
      team => 
        team.name.toLowerCase().includes(query) || 
        team.code.toLowerCase().includes(query) ||
        team.fullName.toLowerCase().includes(query)
    );
  }, [activeLeague, searchQuery, isLeagueActive]);

  const handleToggleTeam = async (league: League, teamCode: string, teamName: string) => {
    setSaving(`${league}-${teamCode}`);
    const { error } = await toggleFavoriteTeam(league, teamCode, teamName);
    if (error) {
      toast.error('팀 저장 실패: ' + error.message);
    }
    setSaving(null);
  };

  const handleContinue = () => {
    if (favoriteTeams.length === 0) {
      toast.warning('최소 1개 이상의 팀을 선택해주세요');
      return;
    }
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-4 space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-display font-bold text-foreground">
              좋아하는 팀 선택
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              경기 일정을 확인할 팀을 선택하세요
            </p>
          </div>

          {/* League Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {LEAGUES.map((league) => {
              const count = favoriteTeams.filter(t => t.league === league.id).length;
              const isActive = LEAGUE_STATUS[league.id].active;
              return (
                <button
                  key={league.id}
                  onClick={() => {
                    setActiveLeague(league.id);
                    setSearchQuery('');
                  }}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeLeague === league.id
                      ? `${getLeagueColor(league.id)} text-white`
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  } ${!isActive ? 'opacity-70' : ''}`}
                >
                  {league.name}
                  {!isActive && <span className="ml-1 text-xs">(준비중)</span>}
                  {count > 0 && isActive && (
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                      activeLeague === league.id 
                        ? 'bg-white/20' 
                        : 'bg-primary/20 text-primary'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Input - 활성 리그만 */}
          {isLeagueActive && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="팀 이름으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-border"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Selected Teams Chips */}
        {favoriteTeams.length > 0 && (
          <div className="px-4 pb-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {favoriteTeams.map((team) => (
                <button
                  key={`${team.league}-${team.team_code}`}
                  onClick={() => handleToggleTeam(team.league as League, team.team_code, team.team_name)}
                  disabled={!!saving}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white ${getLeagueColor(team.league as League)} hover:opacity-90 transition-opacity`}
                >
                  <span className="max-w-[100px] truncate">{team.team_name}</span>
                  <X className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Team List or Coming Soon */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {!isLeagueActive ? (
          // 준비중 화면
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className={`w-20 h-20 rounded-2xl ${getLeagueColor(activeLeague)} flex items-center justify-center mb-6`}>
              <Construction className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground mb-2">
              {activeLeague} 준비중
            </h2>
            <p className="text-muted-foreground max-w-xs">
              {LEAGUE_STATUS[activeLeague].message || '곧 서비스 예정입니다!'}
            </p>
          </div>
        ) : (
          // 팀 리스트
          <div className="space-y-2">
            {filteredTeams.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                검색 결과가 없습니다
              </div>
            ) : (
              filteredTeams.map((team) => {
                const isFavorite = isTeamFavorite(team.code, activeLeague);
                const isSaving = saving === `${activeLeague}-${team.code}`;

                return (
                  <button
                    key={team.code}
                    onClick={() => handleToggleTeam(activeLeague, team.code, team.name)}
                    disabled={!!saving}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                      isFavorite
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-muted/50 border-2 border-transparent hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                        isFavorite 
                          ? `${getLeagueColor(activeLeague)} text-white` 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {team.code}
                      </div>
                      <span className={`font-medium truncate ${
                        isFavorite ? 'text-foreground' : 'text-foreground/80'
                      }`}>
                        {team.fullName}
                      </span>
                    </div>
                    
                    <div className="flex-shrink-0 ml-2">
                      {isSaving ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : isFavorite ? (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getLeagueColor(activeLeague)}`}>
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
        <Button
          onClick={handleContinue}
          className="w-full h-14 text-lg font-medium gradient-primary hover:opacity-90"
        >
          <Check className="mr-2 h-5 w-5" />
          완료 ({favoriteTeams.length}팀 선택됨)
        </Button>
      </div>
    </div>
  );
};

export default TeamSelection;
