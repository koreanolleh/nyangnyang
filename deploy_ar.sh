#!/bin/bash
# 디자인짐 매트 AR 테스트 페이지 배포 (nyangnyang.kr/ar/)
cd "$(dirname "$0")"
git add ar deploy_ar.sh
git commit -m "Add Design:Gym mat AR viewer (ar/)" || true
git push
echo ""
echo "배포 완료. 1~2분 뒤 폰에서 열기 → https://nyangnyang.kr/ar/"
