// Job 타입에 따른 색상 변환
export const getJobTypeColor = (jobType) => {
	switch (jobType) {
		case '탱커':
			return '#3b82f6'; // 파랑
		case '힐러':
			return '#22c55e'; // 초록
		case '딜러':
			return '#ef4444'; // 빨강
		default:
			return '#9ca3af'; // 회색
	}
};

// Job에 따른 색상 변환
export const getJobColor = (job) => {
	// 탱커
  if (['전사', '나이트', '암흑기사', '건브레이커'].includes(job)) {
    return '#3b82f6'; // 파랑
  }
  // 힐러
  if (['백마도사', '학자', '점성술사', '현자'].includes(job)) {
    return '#22c55e'; // 초록
  }
  // 딜러
  return '#ef4444'; // 빨강
}

// 아이템 타입별 그룹화
export const groupItemsByType = (items) => {
	const grouped = {
		무기: [],
		방어구: {
			모자: [],
			상의: [],
			장갑: [],
			하의: [],
			신발: [],
		},
		장신구: {
			귀걸이: [],
			목걸이: [],
			팔찌: [],
			반지1: [],
			반지2: [],
		},
	};

	items.forEach(item => {
		if (item.type === '무기') {
			grouped.무기.push(item);
		} else if (['모자', '상의', '장갑', '하의', '신발'].includes(item.type)) {
			grouped.방어구[item.type].push(item);
		} else {
			grouped.장신구[item.type].push(item);
		}
	});

	return grouped;
};

// 날짜 포맷 함수
export const formatDate = (dateString) => {
	const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
	return new Date(dateString).toLocaleDateString('ko-KR', options);
};

// 비스 세트 진행률 계산
export const calculateBisProgress = (bisSet) => {
	if (!bisSet || !bisSet.items) return 0;

	// 필요한 모든 슬롯
	const requiredSlots = [
		'무기', '모자', '상의', '장갑', '하의', '신발',
    '귀걸이', '목걸이', '팔찌', '반지1', '반지2'
	];

	// 채워진 슬롯 수
	const filledSlots = bisSet.items.length;

	return Math.round((filledSlots / requiredSlots.length) * 100);
};

// 플레이어의 필요 재화 계산
export const calculateTotalResources = (resources) => {
	if (!resources) return {};

	return Object.keys(resources).reduce((total, key) => {
		total[key] = resources[key];
		return total;
	}, {});
};