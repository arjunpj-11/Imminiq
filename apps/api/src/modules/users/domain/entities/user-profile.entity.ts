export type UserProfileEntityProps = {
  id?: string
  userId: string
  fullName: string
  headline: string
  bio: string
  location: string
  education: string
  skills: string[]
  interests: string[]
  githubUrl: string
  linkedinUrl: string
  portfolioUrl: string
  profileBannerUrl: string
  publicProfileEnabled: boolean
  publishedCount: number
  cloneCount: number
  ratingAverage: number
  likeCount: number
}

export class UserProfileEntity {
  readonly id?: string
  readonly userId: string
  readonly fullName: string
  readonly headline: string
  readonly bio: string
  readonly location: string
  readonly education: string
  readonly skills: string[]
  readonly interests: string[]
  readonly githubUrl: string
  readonly linkedinUrl: string
  readonly portfolioUrl: string
  readonly profileBannerUrl: string
  readonly publicProfileEnabled: boolean
  readonly publishedCount: number
  readonly cloneCount: number
  readonly ratingAverage: number
  readonly likeCount: number

  constructor(props: UserProfileEntityProps) {
    if (props.id !== undefined) this.id = props.id
    this.userId = props.userId
    this.fullName = props.fullName
    this.headline = props.headline
    this.bio = props.bio
    this.location = props.location
    this.education = props.education
    this.skills = props.skills
    this.interests = props.interests
    this.githubUrl = props.githubUrl
    this.linkedinUrl = props.linkedinUrl
    this.portfolioUrl = props.portfolioUrl
    this.profileBannerUrl = props.profileBannerUrl
    this.publicProfileEnabled = props.publicProfileEnabled
    this.publishedCount = props.publishedCount
    this.cloneCount = props.cloneCount
    this.ratingAverage = props.ratingAverage
    this.likeCount = props.likeCount
  }
}
