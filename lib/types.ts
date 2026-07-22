export type ProfileLink = {
  id: string;
  platform: string;
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
  bio: string;
  trackTitle: string;
  trackArtist: string;
  trackPreviewUrl: string;
  trackArtworkUrl: string;
  trackUrl: string;
  avatarUrl: string;
  paletteKey: string;
  viewCount: number;
  badges: ProfileBadgeView[];
  links: ProfileLink[];
};
