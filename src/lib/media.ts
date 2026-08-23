/** Local product images (generated for catalog) + curated CDN photos */

export const LOCAL = {
  nikePegasus: "/products/nike-pegasus-41.jpg",
  nikeVaporfly: "/products/nike-vaporfly.jpg",
  nikeAirForce: "/products/nike-air-force.jpg",
  jordan1: "/products/jordan-1.jpg",
  nikeMercurial: "/products/nike-mercurial.jpg",
  adidasUltraboost: "/products/adidas-ultraboost.jpg",
  adidasSamba: "/products/adidas-samba.jpg",
  adidasPredator: "/products/adidas-predator.jpg",
  asicsKayano: "/products/asics-kayano.jpg",
  asicsNimbus: "/products/asics-nimbus.jpg",
};

const px = (id: number, size = 800) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${size}&h=${size}&fit=crop`;

export const SHOE = {
  whiteBlue: LOCAL.nikePegasus,
  vaporfly: LOCAL.nikeVaporfly,
  airForce: LOCAL.nikeAirForce,
  jordan: LOCAL.jordan1,
  mercurial: LOCAL.nikeMercurial,
  ultraboost: LOCAL.adidasUltraboost,
  samba: LOCAL.adidasSamba,
  predator: LOCAL.adidasPredator,
  kayano: LOCAL.asicsKayano,
  nimbus: LOCAL.asicsNimbus,
  // remaining from curated stock (product-like shots)
  greySuede: px(30755567),
  yellowFlat: px(19882424),
  yellowHoodie: px(19882433),
  greenLeaf: px(19882430),
  spiral: px(1971979),
  orangeCourt: px(29699313),
  redWhite: px(10963373),
  jordanFloor: px(11718014),
  blueCourt: px(27100548),
  boxes: px(2364582),
  model: px(2364580),
  cleaner: px(9507116),
  barefoot: px(356175),
};

export const GEAR = {
  soccerBall: px(28222529),
  basketball: px(8817543),
  gi: px(38383524),
  surfboard: px(38728781),
  kneePad: px(12495947),
  tshirt: px(11767211),
  watch: px(31541678),
  bandTraining: px(28970127),
};

export const PEOPLE = {
  coachMan: px(7752811, 500),
  runnerWoman: px(20085710, 500),
  bjjMan: px(33594031, 500),
  basketWoman: px(179908, 500),
  surfMan: px(13892542, 500),
  volleyWoman: px(17460018, 500),
  padel: px(11767211, 500),
  training: px(28970127, 500),
};

const pxWide = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200&h=675&fit=crop`;

export const NEWS_IMG = {
  stadiumNight: pxWide(35898730),
  youthSoccer: pxWide(36862460),
  soccerAction: pxWide(36862523),
  soccerMatch: pxWide(38069076),
  soccerField: pxWide(31105971),
  basketCourt: pxWide(32885654),
  marathon: pxWide(16550006),
  runnerTrack: pxWide(20085710),
  volley: pxWide(17460018),
  surfers: pxWide(7498945),
  training: pxWide(28970127),
  cleats: pxWide(13558754),
};
