// Original source palettes; existing six palettes remain unchanged.
const palette=(name,ground,body,leaf,stone,cloth,glow)=>({name,description:`${name} · continental landscape and equipment palette`,ground,body,leaf,stone,cloth,glow,wood:body,light:'#d9d3b8',dark:'#343e46',metal:'#aeb6bc',trim:glow});
export const CONTINENT_PALETTES={
 rainforest:palette('Rainforest','#517969','#78694f','#3f7966','#879a87','#517c73','#c3d879'),
 orchid:palette('Orchid wilds','#8f829e','#8b799a','#a292b2','#a9a1b1','#78628d','#e0b8e8'),
 redrock:palette('Red granite','#a07b61','#976a51','#8c905d','#9e7361','#8b6353','#e0ae79'),
 crystal:palette('Prismatic highlands','#7f91a0','#677b91','#819a9b','#98a6bd','#687b9e','#a8d8e7'),
 desert:palette('Saffron desert','#c2ac79','#a2885e','#9d9a6a','#c3a47a','#a17754','#efd291'),
 coral:palette('Coral shores','#9eb3ac','#8c9e96','#82a49c','#c4b9ae','#6e929f','#e7b9cb'),
 storm:palette('Storm coast','#637d86','#5c6b76','#6c8b82','#73828f','#556e88','#b1d4df'),
 abyss:palette('Abyssal shelves','#496e78','#4c727b','#5d8d8b','#6b919b','#4b697c','#9cddd4'),
 astral:palette('Astral wastes','#777c98','#6d7088','#9098b1','#9a9fb9','#6c6590','#d1c4ed')
};
