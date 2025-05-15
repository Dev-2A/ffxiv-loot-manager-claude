// 마테리쟈 종류
export const MATERIA_TYPES = [
  { value: '무략', label: '무략' },
  { value: '야망', label: '야망' },
  { value: '심안', label: '심안' },
  { value: '기술속도', label: '기술속도' },
  { value: '시전속도', label: '시전속도' },
  { value: '신앙', label: '신앙' },
  { value: '강유', label: '강유' },
];

// 아이템 타입별 최대 마테리쟈 슬롯
export const getMaxMateriaSlots = (itemType, itemSource) => {
  if (itemSource === '제작템') {
    return 5;
  } else if (['귀걸이', '목걸이', '팔찌', '반지1', '반지2'].includes(itemType)) {
    return 1;
  } else {
    return 2;
  }
};

// 마테리쟈 타입별 색상
export const getMateriaColor = (type) => {
  const colorMap = {
    '무략': '#d32f2f', // 빨간색
    '야망': '#d32f2f',
    '심안': '#d32f2f',
    '기술속도': '#6200ea', // 보라색
    '시전속도': '#6200ea',
    '신앙': '#ffab00', // 주황색
    '강유': '#ffab00',
  };
  
  return colorMap[type] || '#9e9e9e'; // 기본 회색
};