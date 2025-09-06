// ========================================
// USER & AUTHENTICATION
// ========================================

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  dateOfBirth?: string;
  location?: Location;
  timezone?: string;
  language: string;
  psychotype: Psychotype;
  psychotypeTestCompleted: boolean;
  isParent: boolean;
  parentModeEnabled: boolean;
  isVerified: boolean;
  isActive: boolean;
  isPremium: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  lastActiveAt?: string;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export type Psychotype = 'EXTROVERT' | 'INTROVERT' | 'AMBIVERT' | 'UNKNOWN';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ========================================
// DOG PROFILES
// ========================================

export interface Dog {
  id: string;
  name: string;
  breed?: string;
  breedId?: string;
  age?: number;
  weight?: number;
  height?: number;
  color?: string;
  gender: Gender;
  isNeutered?: boolean;
  microchipNumber?: string;
  passportNumber?: string;
  medicalHistory?: any;
  vaccinations?: any;
  allergies: string[];
  medications: string[];
  temperament: Temperament[];
  energyLevel: EnergyLevel;
  sociability: Sociability;
  trainability: Trainability;
  avatar?: string;
  photos: DogPhoto[];
  parentId?: string;
  parent?: Dog;
  children: Dog[];
  isActive: boolean;
  isLost: boolean;
  isAdopted: boolean;
  createdAt: string;
  updatedAt: string;
  lastWalkAt?: string;
}

export type Gender = 'MALE' | 'FEMALE' | 'UNKNOWN';

export type Temperament = 
  | 'FRIENDLY' | 'SHY' | 'AGGRESSIVE' | 'PLAYFUL' 
  | 'CALM' | 'ENERGETIC' | 'INDEPENDENT' | 'DEPENDENT';

export type EnergyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export type Sociability = 'VERY_SOCIAL' | 'SOCIAL' | 'MODERATE' | 'SHY' | 'ANTI_SOCIAL';

export type Trainability = 'EASY' | 'MODERATE' | 'DIFFICULT' | 'VERY_DIFFICULT';

export interface DogPhoto {
  id: string;
  dogId: string;
  url: string;
  caption?: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface DogOwnership {
  id: string;
  userId: string;
  dogId: string;
  role: OwnerRole;
  isPrimary: boolean;
  permissions?: any;
  joinedAt: string;
  user: User;
  dog: Dog;
}

export type OwnerRole = 'OWNER' | 'CO_OWNER' | 'WALKER' | 'TRAINER' | 'OBSERVER';

// ========================================
// GAMIFICATION & ECONOMY
// ========================================

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  description?: string;
  metadata?: any;
  balance: number;
  createdAt: string;
}

export type TransactionType = 
  | 'EARN' | 'SPEND' | 'BURN' | 'TRANSFER' 
  | 'REFUND' | 'BONUS' | 'PENALTY';

export type Currency = 'BONES' | 'YARN';

export interface Level {
  id: string;
  userId: string;
  level: number;
  experience: number;
  tier: Tier;
  badges: Badge[];
  createdAt: string;
  updatedAt: string;
}

export type Tier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

export interface Achievement {
  id: string;
  dogId: string;
  type: AchievementType;
  title: string;
  description: string;
  icon?: string;
  points: number;
  unlockedAt: string;
  dog: Dog;
}

export type AchievementType = 'WALKING' | 'SOCIAL' | 'TRAINING' | 'HEALTH' | 'SPECIAL';

export interface Badge {
  id: string;
  levelId: string;
  type: BadgeType;
  title: string;
  description: string;
  icon?: string;
  unlockedAt: string;
  level: Level;
}

export type BadgeType = 'MILESTONE' | 'SPECIAL' | 'EVENT' | 'SEASONAL';

// ========================================
// REFERRAL SYSTEM
// ========================================

export interface ReferralCode {
  id: string;
  userId: string;
  code: string;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  user: User;
  referrals: Referral[];
}

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  codeId: string;
  status: ReferralStatus;
  bonusPaid: boolean;
  bonusAmount?: number;
  createdAt: string;
  completedAt?: string;
  referrer: User;
  referred: User;
  code: ReferralCode;
}

export type ReferralStatus = 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';

// ========================================
// MAP & COLLECTIBLES
// ========================================

export interface CollectibleSpawn {
  id: string;
  type: CollectibleType;
  location: Location;
  amount: number;
  maxAmount?: number;
  collectedBy: string[];
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  collections: CollectibleCollection[];
}

export type CollectibleType = 'BONE' | 'YARN_BALL' | 'TOY' | 'TREAT' | 'SPECIAL';

export interface CollectibleCollection {
  id: string;
  userId: string;
  dogId?: string;
  spawnId: string;
  amount: number;
  collectedAt: string;
  user: User;
  dog?: Dog;
  spawn: CollectibleSpawn;
}

// ========================================
// MATCHING SYSTEM
// ========================================

export interface Match {
  id: string;
  userId1: string;
  userId2: string;
  dogId1?: string;
  dogId2?: string;
  status: MatchStatus;
  bondLevel: number;
  totalWalks: number;
  lastWalkAt?: string;
  createdAt: string;
  updatedAt: string;
  user1: User;
  user2: User;
  dog1?: Dog;
  dog2?: Dog;
  invites: MatchInvite[];
}

export type MatchStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface MatchInvite {
  id: string;
  fromUserId: string;
  toUserId: string;
  matchId?: string;
  message?: string;
  status: InviteStatus;
  expiresAt?: string;
  createdAt: string;
  respondedAt?: string;
  fromUser: User;
  toUser: User;
  match?: Match;
}

export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

// ========================================
// SOCIAL FEATURES
// ========================================

export interface Post {
  id: string;
  userId: string;
  dogId?: string;
  content: string;
  images: string[];
  video?: string;
  location?: Location;
  isPublic: boolean;
  isStory: boolean;
  storyExpiresAt?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  updatedAt: string;
  user: User;
  dog?: Dog;
  comments: Comment[];
  likes: Like[];
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentId?: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  post: Post;
  user: User;
  parent?: Comment;
  replies: Comment[];
  likes: Like[];
}

export interface Like {
  id: string;
  userId: string;
  postId?: string;
  commentId?: string;
  createdAt: string;
  user: User;
  post?: Post;
  comment?: Comment;
}

// ========================================
// JOURNAL & GOALS
// ========================================

export interface JournalEntry {
  id: string;
  userId: string;
  dogId?: string;
  title?: string;
  content: string;
  mood?: Mood;
  activities: Activity[];
  images: string[];
  location?: Location;
  weather?: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
  dog?: Dog;
}

export type Mood = 
  | 'HAPPY' | 'EXCITED' | 'CALM' | 'ANXIOUS' 
  | 'SAD' | 'ANGRY' | 'NEUTRAL';

export type Activity = 
  | 'WALK' | 'PLAY' | 'TRAINING' | 'FEEDING' 
  | 'GROOMING' | 'VET_VISIT' | 'SOCIAL' | 'REST';

export interface Goal {
  id: string;
  userId: string;
  dogId?: string;
  title: string;
  description?: string;
  type: GoalType;
  target?: number;
  current: number;
  unit?: string;
  deadline?: string;
  isCompleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  user: User;
  dog?: Dog;
}

export type GoalType = 'WALKING' | 'TRAINING' | 'SOCIAL' | 'HEALTH' | 'BEHAVIOR' | 'CUSTOM';

// ========================================
// DAO & GOVERNANCE
// ========================================

export interface DAOProposal {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: ProposalType;
  status: ProposalStatus;
  budget?: number;
  startDate?: string;
  endDate?: string;
  minStake: number;
  totalStake: number;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  createdAt: string;
  updatedAt: string;
  executedAt?: string;
  user: User;
  votes: DAOVote[];
  stakes: DAOStake[];
}

export type ProposalType = 
  | 'FEATURE' | 'EVENT' | 'PARTNERSHIP' | 'CHARITY' 
  | 'INFRASTRUCTURE' | 'OTHER';

export type ProposalStatus = 
  | 'DRAFT' | 'ACTIVE' | 'VOTING' | 'EXECUTED' 
  | 'REJECTED' | 'EXPIRED';

export interface DAOVote {
  id: string;
  userId: string;
  proposalId: string;
  vote: VoteType;
  stake?: number;
  reason?: string;
  createdAt: string;
  user: User;
  proposal: DAOProposal;
}

export type VoteType = 'YES' | 'NO' | 'ABSTAIN';

export interface DAOStake {
  id: string;
  userId: string;
  proposalId?: string;
  amount: number;
  type: StakeType;
  isActive: boolean;
  createdAt: string;
  unlockedAt?: string;
  user: User;
  proposal?: DAOProposal;
}

export type StakeType = 'VOTING' | 'REWARD' | 'PENALTY';

// ========================================
// PARTNERS & ADMIN
// ========================================

export interface PartnerProfile {
  id: string;
  userId: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  category: PartnerCategory;
  location?: Location;
  contact?: any;
  isVerified: boolean;
  isActive: boolean;
  commissionRate: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export type PartnerCategory = 
  | 'VET' | 'GROOMER' | 'TRAINER' | 'PET_STORE' 
  | 'DOG_WALKER' | 'DOG_SITTER' | 'BREEDER' | 'RESCUE' | 'OTHER';

export interface AdminProfile {
  id: string;
  userId: string;
  role: AdminRole;
  permissions?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export type AdminRole = 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

// ========================================
// NOTIFICATIONS & MESSAGING
// ========================================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  isSent: boolean;
  createdAt: string;
  readAt?: string;
  user: User;
}

export type NotificationType = 
  | 'MATCH' | 'INVITE' | 'ACHIEVEMENT' | 'LEVEL_UP' 
  | 'REFERRAL' | 'DAO' | 'SYSTEM' | 'PARTNER';

export interface Message {
  id: string;
  userId: string;
  roomId: string;
  content: string;
  type: MessageType;
  metadata?: any;
  isRead: boolean;
  createdAt: string;
  user: User;
}

export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'LOCATION' | 'SYSTEM';

// ========================================
// API RESPONSES
// ========================================

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ========================================
// FORM DATA TYPES
// ========================================

export interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  location?: Location;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface CreateDogFormData {
  name: string;
  breed?: string;
  age?: number;
  weight?: number;
  height?: number;
  color?: string;
  gender: Gender;
  isNeutered?: boolean;
  temperament: Temperament[];
  energyLevel: EnergyLevel;
  sociability: Sociability;
  trainability: Trainability;
}

export interface CreatePostFormData {
  content: string;
  dogId?: string;
  images?: File[];
  video?: File;
  location?: Location;
  isPublic?: boolean;
  isStory?: boolean;
}

export interface CreateGoalFormData {
  title: string;
  description?: string;
  type: GoalType;
  target?: number;
  unit?: string;
  deadline?: string;
  dogId?: string;
}

export interface CreateProposalFormData {
  title: string;
  description: string;
  type: ProposalType;
  budget?: number;
  startDate?: string;
  endDate?: string;
  minStake?: number;
}

// ========================================
// UI STATE TYPES
// ========================================

export interface UIState {
  sidebarOpen: boolean;
  modalOpen: boolean;
  loading: boolean;
  error: string | null;
}

export interface MapState {
  userLocation: Location | null;
  nearbyUsers: User[];
  collectibles: CollectibleSpawn[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface FeedState {
  posts: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
}

export interface WalletState {
  balance: { bones: number; yarn: number };
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

// ========================================
// EVENT TYPES
// ========================================

export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: string;
}

export interface MapEvent {
  type: 'USER_NEARBY' | 'COLLECTIBLE_SPAWN' | 'COLLECTIBLE_COLLECTED';
  data: any;
  location: Location;
}

export interface NotificationEvent {
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

// ========================================
// UTILITY TYPES
// ========================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type ExcludeFields<T, K extends keyof T> = Omit<T, K>;

export type PickFields<T, K extends keyof T> = Pick<T, K>;

export type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

export type NonNullable<T> = T extends null | undefined ? never : T;

export type Nullable<T> = T | null;

export type OptionalNullable<T> = T | null | undefined; 