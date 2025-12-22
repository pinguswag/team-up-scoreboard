import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useFavoriteTeams } from '@/hooks/useFavoriteTeams';
import { useSchedule } from '@/hooks/useSchedule';
import { getLeagueColor, League, LEAGUES, LEAGUE_STATUS } from '@/data/teams';
import { CalendarDays, Settings, LogOut, Loader2, Clock, Trophy, Construction } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { ko } from 'date-fns/locale';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { favoriteTeams, loading: teamsLoading } = useFavoriteTeams(user?.id);
  const [activeLeague, setActiveLeague] = useState<League>('EPL');
  
  const { games, loading: scheduleLoading, error: scheduleError } = useSchedule(favoriteTeams, activeLeague);

  const loading = authLoading || teamsLoading;
  const isLeagueActive = LEAGUE_STATUS[activeLeague].active;

  // 해당 리그의 선택된 팀 수
  const selectedTeamsCount = useMemo(() => {
    return favoriteTeams.filter(t => t.league === activeLeague).length;
  }, [favoriteTeams, activeLeague]);

  // 일정을 날짜별로 그룹핑
  const groupedGames = useMemo(() => {
    const grouped: Record<string, typeof games> = {};
    games.forEach((game) => {
      if (!grouped[game.date]) {
        grouped[game.date] = [];
      }
      grouped[game.date].push(game);
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, dateGames]) => ({ date, games: dateGames }));
  }, [games]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return '오늘';
    if (isTomorrow(date)) return '내일';
    return format(date, 'M월 d일 (EEE)', { locale: ko });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-lg font-display font-bold text-primary-foreground">SF</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Sports<span className="text-primary">Fan</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/teams')}
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
        {/* No Teams Selected - Global */}
        {favoriteTeams.length === 0 && (
          <Card className="glass border-dashed border-2 border-primary/30">
            <CardContent className="p-8 text-center space-y-4">
              <Trophy className="h-16 w-16 mx-auto text-primary" />
              <h2 className="text-xl font-display font-bold text-foreground">
                팀을 선택해주세요
              </h2>
              <p className="text-muted-foreground">
                좋아하는 팀을 선택하면 경기 일정을 확인할 수 있습니다
              </p>
              <Button
                onClick={() => navigate('/teams')}
                className="gradient-primary"
              >
                팀 선택하기
              </Button>
            </CardContent>
          </Card>
        )}

        {/* League Tabs */}
        {favoriteTeams.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {LEAGUES.map((league) => {
              const count = favoriteTeams.filter(t => t.league === league.id).length;
              const isActive = LEAGUE_STATUS[league.id].active;
              return (
                <button
                  key={league.id}
                  onClick={() => setActiveLeague(league.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeLeague === league.id
                      ? `${getLeagueColor(league.id)} text-white`
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  } ${!isActive ? 'opacity-70' : ''}`}
                >
                  {league.name}
                  {!isActive && <span className="ml-1 text-xs">(준비중)</span>}
                  {count > 0 && (
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
        )}

        {/* Content based on league status */}
        {favoriteTeams.length > 0 && (
          <>
            {!isLeagueActive ? (
              // 준비중 리그
              <Card className="glass border-border/50">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                  <div className={`w-16 h-16 rounded-2xl ${getLeagueColor(activeLeague)} flex items-center justify-center mb-4`}>
                    <Construction className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-lg font-display font-bold text-foreground mb-2">
                    {activeLeague} 준비중
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {LEAGUE_STATUS[activeLeague].message || '곧 서비스 예정입니다!'}
                  </p>
                </CardContent>
              </Card>
            ) : selectedTeamsCount === 0 ? (
              // 해당 리그에 선택된 팀 없음
              <Card className="glass border-border/50">
                <CardContent className="p-8 text-center space-y-4">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {activeLeague} 팀을 선택해 주세요
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/teams')}
                  >
                    팀 선택하기
                  </Button>
                </CardContent>
              </Card>
            ) : scheduleLoading ? (
              // 로딩 중
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : scheduleError ? (
              // 에러
              <Card className="glass border-destructive/30">
                <CardContent className="p-8 text-center">
                  <p className="text-destructive">{scheduleError}</p>
                </CardContent>
              </Card>
            ) : groupedGames.length === 0 ? (
              // 일정 없음
              <Card className="glass border-border/50">
                <CardContent className="p-8 text-center">
                  <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">예정된 경기가 없습니다</p>
                </CardContent>
              </Card>
            ) : (
              // 일정 표시
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-display font-bold text-foreground">경기 일정</h2>
                </div>

                {groupedGames.map(({ date, games: dateGames }) => (
                  <div key={date} className="space-y-3">
                    <Badge
                      variant={isToday(parseISO(date)) ? 'default' : 'secondary'}
                      className={isToday(parseISO(date)) ? 'gradient-primary' : ''}
                    >
                      {getDateLabel(date)}
                    </Badge>
                    
                    <div className="space-y-2">
                      {dateGames.map((game) => (
                        <Card key={game.id} className="glass border-border/50 hover:border-primary/30 transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {game.time && (
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
                                    <Clock className="h-4 w-4" />
                                    {game.time}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-foreground truncate">
                                    {game.away_team} @ {game.home_team}
                                  </p>
                                  {game.day && (
                                    <p className="text-xs text-muted-foreground">{game.day}</p>
                                  )}
                                </div>
                              </div>
                              <Badge className={`${getLeagueColor(game.league)} text-primary-foreground text-xs flex-shrink-0 ml-2`}>
                                {game.league}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Selected Teams for current league */}
            {selectedTeamsCount > 0 && isLeagueActive && (
              <section className="pb-8">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  선택한 {activeLeague} 팀
                </h3>
                <div className="flex flex-wrap gap-2">
                  {favoriteTeams
                    .filter(t => t.league === activeLeague)
                    .map((team) => (
                      <Badge
                        key={`${team.league}-${team.team_code}`}
                        variant="secondary"
                        className={`${getLeagueColor(team.league as League)} text-primary-foreground`}
                      >
                        {team.team_code}
                      </Badge>
                    ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/teams')}
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    수정
                  </Button>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
