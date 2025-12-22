import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useFavoriteTeams } from '@/hooks/useFavoriteTeams';
import { useSchedule, ScheduleItem } from '@/hooks/useSchedule';
import { getLeagueColor, League } from '@/data/teams';
import { CalendarDays, Settings, LogOut, Loader2, Clock, Trophy, AlertCircle } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { favoriteTeams, loading: teamsLoading } = useFavoriteTeams(user?.id);
  const { todayGames, weekGames, loading: scheduleLoading, error } = useSchedule(favoriteTeams);

  const loading = authLoading || teamsLoading;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
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

  const GameCard = ({ game }: { game: ScheduleItem }) => {
    const timeDisplay = game.startTime || '시간 미정';

    return (
      <Card className="glass border-border/50 hover:border-primary/30 transition-all">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Badge className={`${getLeagueColor(game.league as League)} text-primary-foreground text-xs font-medium`}>
              {game.league}
            </Badge>
            <div className="flex items-center gap-1.5 text-sm">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={game.startTime ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                {timeDisplay}
              </span>
              {game.startTime && <span className="text-xs text-muted-foreground">KST</span>}
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0 text-center">
              <p className="font-display font-bold text-base text-foreground truncate">
                {game.home.code || game.home.name || '-'}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {game.home.name || ''}
              </p>
            </div>
            <div className="flex-shrink-0 px-2">
              <span className="text-lg font-bold text-muted-foreground/60">vs</span>
            </div>
            <div className="flex-1 min-w-0 text-center">
              <p className="font-display font-bold text-base text-foreground truncate">
                {game.away.code || game.away.name || '-'}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {game.away.name || ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const LoadingSkeleton = () => (
    <div className="grid gap-3 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="glass border-border/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="flex justify-between items-center gap-2">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-12 flex-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const EmptyState = () => (
    <Card className="glass border-border/50">
      <CardContent className="p-6 text-center">
        <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-muted-foreground">선택한 팀의 경기 일정이 없습니다</p>
      </CardContent>
    </Card>
  );

  const ErrorState = () => (
    <Card className="glass border-destructive/30">
      <CardContent className="p-6 text-center">
        <AlertCircle className="h-10 w-10 mx-auto text-destructive/70 mb-2" />
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => window.location.reload()}>
          다시 시도
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-sm font-display font-bold text-primary-foreground">SF</span>
            </div>
            <span className="font-display font-bold text-lg text-foreground">
              Sports<span className="text-primary">Fan</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/teams')}
              className="h-9 w-9"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="h-9 w-9"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-5 space-y-6 animate-fade-in">
        {/* No Teams Selected */}
        {favoriteTeams.length === 0 && (
          <Card className="glass border-dashed border-2 border-primary/30">
            <CardContent className="p-6 text-center space-y-3">
              <Trophy className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-lg font-display font-bold text-foreground">
                팀을 선택해주세요
              </h2>
              <p className="text-sm text-muted-foreground">
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

        {/* Error State */}
        {error && favoriteTeams.length > 0 && <ErrorState />}

        {/* Today's Games Section */}
        {favoriteTeams.length > 0 && !error && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-display font-bold text-foreground">오늘의 경기</h2>
              <span className="text-xs text-muted-foreground ml-auto">
                {format(new Date(), 'M월 d일 (EEE)', { locale: ko })}
              </span>
            </div>

            {scheduleLoading ? (
              <LoadingSkeleton />
            ) : todayGames.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {todayGames.map((game, index) => (
                  <GameCard key={`today-${game.league}-${game.home.code}-${game.away.code}-${index}`} game={game} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* This Week's Games Section */}
        {favoriteTeams.length > 0 && !error && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-display font-bold text-foreground">이번 주 일정</h2>
            </div>

            {scheduleLoading ? (
              <LoadingSkeleton />
            ) : weekGames.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-5">
                {weekGames.map(({ date, games }) => (
                  <div key={date}>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={isToday(parseISO(date)) ? 'default' : 'secondary'}
                        className={isToday(parseISO(date)) ? 'gradient-primary text-xs' : 'text-xs'}
                      >
                        {isToday(parseISO(date))
                          ? '오늘'
                          : format(parseISO(date), 'M월 d일 (EEE)', { locale: ko })}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{games.length}경기</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {games.map((game, index) => (
                        <GameCard key={`week-${date}-${game.league}-${game.home.code}-${game.away.code}-${index}`} game={game} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Favorite Teams Chips */}
        {favoriteTeams.length > 0 && (
          <section className="pb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">내가 선택한 팀</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/teams')}
                className="text-xs text-primary h-7 px-2"
              >
                수정
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {favoriteTeams.map((team) => (
                <Badge
                  key={`${team.league}-${team.team_code}`}
                  variant="secondary"
                  className={`${getLeagueColor(team.league as League)} text-primary-foreground text-xs`}
                >
                  {team.team_code}
                </Badge>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
