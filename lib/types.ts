export type ProfileLink = {
  id: string;
  label: string;
  sub: string;
  url: string;
};

export type ProfileBadgeView = {
  key: string;
  label: string;
};

export type ProfileData = {
  username: string;
  displayName: string;
  eyebrow: string;
  bio: string;
  bioSecondary: string;
  trackTitle: string;
  avatarUrl: string;
  paletteKey: string;
  viewCount: number;
  joinYear: number;
  badges: ProfileBadgeView[];
  links: ProfileLink[];
};
