import { PullRequest } from './pullRequest.model';
import moment from 'moment';

interface BasicLeaderboardStat {
  created: number;
  reviewed: number;
  commented: number;
}

export interface LeaderboardItem extends BasicLeaderboardStat {
  email: string;
  points: number;
}

export class LeaderboardBuilder {
  private leaderboardMap = new Map<string, BasicLeaderboardStat>();

  constructor(private options: LeaderboardBuilderOptions) { }

  addMeasures(prs: PullRequest[]): LeaderboardBuilder {
    const weekStartDate = moment().utcOffset(0, true).startOf('isoWeek');
    prs.forEach(pr => {
      // get prs only from current week
      if (moment(pr.createdAt).isSameOrAfter(weekStartDate, 'days')) {
        this.addMeasure(pr.creator, 'created');

        pr.reviews.forEach(review => {
          this.addMeasure(review.creator, 'reviewed');
        });

        pr.comments.forEach(comment => {
          this.addMeasure(comment.creator, 'commented');
        });
      }
    });

    return this;
  }

  getLeaderboard(): LeaderboardItem[] {
    const leaderboard: LeaderboardItem[] = [];
    this.leaderboardMap.forEach((value, key) => {
      leaderboard.push({
        email: key,
        points: this.calculatePoints(value),
        reviewed: value.reviewed,
        commented: value.commented,
        created: value.created
      });
    });

    return leaderboard;
  }

  private calculatePoints(stat: BasicLeaderboardStat): number {
    return stat.created * this.options.pointsPerCreatedRequest
         + stat.reviewed * this.options.pointsPerReview
         + stat.commented * this.options.pointsPerComment;
  }

  private addMeasure(user: string, type: ('created' | 'reviewed' | 'commented')): void {
    if (!this.leaderboardMap.has(user)) {
      this.leaderboardMap.set(user, {
        commented: 0,
        created: 0,
        reviewed: 0
      });
    }

    const currentStat = this.leaderboardMap.get(user);
    switch (type) {
      case 'created':
        currentStat.created++;
        break;
      case 'reviewed':
        currentStat.reviewed++;
        break;
      case 'commented':
        currentStat.commented++;
        break;
    }

    this.leaderboardMap.set(user, currentStat);
  }
}

interface LeaderboardBuilderOptions {
  pointsPerCreatedRequest: number;
  pointsPerReview: number;
  pointsPerComment: number;
}
