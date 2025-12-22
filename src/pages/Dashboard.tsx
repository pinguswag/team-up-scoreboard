import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useFavoriteTeams } from '@/hooks/useFavoriteTeams';
import { DUMMY_GAMES, Game } from '@/data/games';
import { getLeagueColor, getLeagueTextColor, League } from '@/data/teams';
import { CalendarDays, Settings, LogOut, Loader2, Tv, Clock, Trophy } from 'lucide-react';
import { format, isToday, addDays, isSameDay, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { favoriteTeams, loading: teamsLoading } = useFavoriteTeams(user?.id);

  const loading = authLoading || teamsLoading;

  // Filter games for favorite teams
  const myGames = useMemo(() => {
    const favoriteTeamCodes = favoriteTeams.map((t) => ({
      code: t.team_code,
      league: t.league,
    }));

    return DUMMY_GAMES.filter((game) =>
      favoriteTeamCodes.some(
        (team) =>
          (game.homeTeamCode === team.code || game.awayTeamCode === team.code) &&
          game.league === team.league
      )
    );
  }, [favoriteTeams]);

  // Today's games
  const todayGames = useMemo(() => {
    const today = new Date();
    return myGames.filter((game) => isToday(parseISO(game.date)));
  }, [myGames]);

  // This week's games (grouped by date)
  const weekGames = useMemo(() => {
    const today = new Date();
    const weekEnd = addDays(today, 7);
    
    const games = myGames.filter((game) => {
      const gameDate = parseISO(game.date);
      return gameDate >= today && gameDate <= weekEnd;
    });

    // Group by date
    const grouped: Record<string, Game[]> = {};
    games.forEach((game) => {
      if (!grouped[game.date]) {
        grouped[game.date] = [];
      }
      grouped[game.date].push(game);
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, games]) => ({
        date,
        games: games.sort((a, b) => a.time.localeCompare(b.time)),
      }));
  }, [myGames]);

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

  const getBroadcastStyle = (broadcast: string) => {
    if (broadcast === '쿠팡플레이') return 'bg-[hsl(350,80%,50%)] text-primary-foreground';
    if (broadcast === 'SPOTV') return 'bg-[hsl(200,90%,45%)] text-primary-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const GameCard = ({ game }: { game: Game }) => (
    <Card className="glass border-border/50 hover:border-primary/30 transition-all">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Badge className={`${getLeagueColor(game.league)} text-primary-foreground text-xs`}>
            {game.league}
          </Badge>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {game.time}
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 text-center">
            <p className="font-display font-bold text-lg text-foreground">{game.homeTeamCode}</p>
            <p className="text-xs text-muted-foreground truncate">{game.homeTeam}</p>
          </div>
          <div className="px-4">
            <span className="text-xl font-bold text-muted-foreground">VS</span>
          </div>
          <div className="flex-1 text-center">
            <p className="font-display font-bold text-lg text-foreground">{game.awayTeamCode}</p>
            <p className="text-xs text-muted-foreground truncate">{game.awayTeam}</p>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Badge variant="secondary" className={`${getBroadcastStyle(game.broadcast)}`}>
            <Tv className="h-3 w-3 mr-1" />
            {game.broadcast}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

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

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8 animate-fade-in">
        {/* No Teams Selected */}
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

        {/* Today's Games Section */}
        {favoriteTeams.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-display font-bold text-foreground">오늘의 경기</h2>
              <span className="text-sm text-muted-foreground">
                {format(new Date(), 'M월 d일 (EEEE)', { locale: ko })}
              </span>
            </div>

            {todayGames.length === 0 ? (
              <Card className="glass border-border/50">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">오늘 예정된 경기가 없습니다</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {todayGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* This Week's Games Section */}
        {favoriteTeams.length > 0 && weekGames.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-display font-bold text-foreground">이번 주 경기 일정</h2>
            </div>

            <div className="space-y-6">
              {weekGames.map(({ date, games }) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      variant={isToday(parseISO(date)) ? 'default' : 'secondary'}
                      className={isToday(parseISO(date)) ? 'gradient-primary' : ''}
                    >
                      {isToday(parseISO(date))
                        ? '오늘'
                        : format(parseISO(date), 'M월 d일 (EEE)', { locale: ko })}
                    </Badge>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {games.map((game) => (
                      <GameCard key={game.id} game={game} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Favorite Teams Chips */}
        {favoriteTeams.length > 0 && (
          <section className="pb-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">내가 선택한 팀</h3>
            <div className="flex flex-wrap gap-2">
              {favoriteTeams.map((team) => (
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
      </main>
    </div>
  );
};

export default Dashboard;
