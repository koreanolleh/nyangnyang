# Design:Gym 매트 AR 뷰어 — 배포 패키지

이 폴더를 통째로 HTTPS 서버(카페24 웹FTP, GitHub Pages, Netlify 등)에 올리면 됩니다.
AR(카메라)은 반드시 **https** 주소에서만 동작합니다.

## 구성
- index.html            AR 뷰어 페이지 (컬러 3종 전환 + "내 방에 놓아보기" 버튼)
- model-viewer.min.js   구글 <model-viewer> 라이브러리 (자체 호스팅)
- models/mat_*.glb      3D 모델 (Android Scene Viewer / WebXR / 웹 프리뷰용, 실치수 1.83 × 0.61 × 0.008 m)
- models/mat_*.usdz     3D 모델 (iOS AR Quick Look용)
- models/texture_*.jpg  매트 상판 텍스처 원본 (3072 × 1024)

## 카페24 상품 페이지에 "내 방에서 보기" 버튼만 넣고 싶을 때
상품 상세 HTML에 아래를 넣으면 됩니다 (파일 경로는 실제 업로드 위치로 바꾸세요).

    <script type="module" src="/ar/model-viewer.min.js"></script>
    <model-viewer src="/ar/models/mat_warm_sunlight.glb"
                  ios-src="/ar/models/mat_warm_sunlight.usdz"
                  ar ar-modes="webxr scene-viewer quick-look" ar-scale="fixed" ar-placement="floor"
                  camera-controls shadow-intensity="1" style="width:100%;height:420px">
    </model-viewer>

iPhone만 대상으로 앱 없이 가장 단순하게 열고 싶다면 이 한 줄이면 됩니다:

    <a rel="ar" href="/ar/models/mat_warm_sunlight.usdz"><img src="썸네일.jpg"></a>

## 모델 다시 만들기
텍스처(tex/*.jpg)나 치수를 바꾸려면 build_mat.py 의 L, W, T 값을 수정하고 다시 실행하세요.
