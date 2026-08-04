export type HeroSlide = {
  id: number;
  image: string;
  alt_text: string;
  sort_order: number;
  status: 0 | 1;
  created_at: string;
  updated_at: string;
};

export type CreateHeroSlideInput = {
  image: string;
  alt_text: string;
  sort_order: number;
  status: 0 | 1;
};

export type UpdateHeroSlideInput = Partial<CreateHeroSlideInput>;
