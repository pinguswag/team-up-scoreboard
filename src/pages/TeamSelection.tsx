import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LEAGUES, TEAMS, League, getLeagueColor } from '@/data/teams';
import { useFavoriteTeams } from '@/hooks/useFavoriteTeams';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Check, Loader2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeamSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favoriteTeams, isTeamFavorite, toggleFavoriteTeam, loading } = useFavoriteTeams(user?.id);
  const [saving, setSaving] = useState<string | null>(null);
  const [expandedLeague, setExpandedLeague] = useState<League | null>('NBA');

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
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2 py-6">
          <h1 className="text-3xl font-display font-bold text-foreground">
            좋아하는 팀 선택
          </h1>
          <p className="text-muted-foreground">
            경기 일정을 확인할 팀을 선택하세요 (복수 선택 가능)
          </p>
        </div>

        {/* Selected Teams Count */}
        {favoriteTeams.length > 0 && (
          <div className="glass rounded-xl p-4 flex items-center justify-between">
            <span className="text-foreground font-medium">
              선택된 팀: <span className="text-primary">{favoriteTeams.length}개</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {favoriteTeams.slice(0, 3).map((team) => (
                <span
                  key={`${team.league}-${team.team_code}`}
                  className={`text-xs px-2 py-1 rounded-full text-primary-foreground ${getLeagueColor(team.league as League)}`}
                >
                  {team.team_code}
                </span>
              ))}
              {favoriteTeams.length > 3 && (
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  +{favoriteTeams.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* League Sections */}
        <div className="space-y-3">
          {LEAGUES.map((league) => (
            <Card
              key={league.id}
              className="glass border-border/50 overflow-hidden"
            >
              <CardHeader
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  expandedLeague === league.id ? 'border-b border-border' : ''
                }`}
                onClick={() => setExpandedLeague(expandedLeague === league.id ? null : league.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getLeagueColor(league.id)}`} />
                    <CardTitle className="text-lg font-display">{league.name}</CardTitle>
                    <span className="text-sm text-muted-foreground">
                      ({favoriteTeams.filter(t => t.league === league.id).length} 선택)
                    </span>
                  </div>
                  <ChevronRight
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      expandedLeague === league.id ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </CardHeader>
              {expandedLeague === league.id && (
                <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TEAMS[league.id].map((team) => {
                    const isFavorite = isTeamFavorite(team.code, league.id);
                    const isSaving = saving === `${league.id}-${team.code}`;
                    
                    return (
                      <button
                        key={team.code}
                        onClick={() => handleToggleTeam(league.id, team.code, team.name)}
                        disabled={!!saving}
                        className={`relative flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                          isFavorite
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <Checkbox
                          checked={isFavorite}
                          className="pointer-events-none"
                        />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-foreground text-sm truncate">
                            {team.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{team.code}</p>
                        </div>
                        {isSaving && (
                          <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
                        )}
                      </button>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleContinue}
            className="w-full h-14 text-lg font-medium gradient-primary hover:opacity-90"
          >
            <Check className="mr-2 h-5 w-5" />
            완료 ({favoriteTeams.length}팀 선택됨)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeamSelection;
