// 초기 슬라이드 인덱스를 1로 설정합니다.
let slideIndex = 1;

// 초기 슬라이드를 표시합니다.
showSlides(slideIndex);

// 슬라이드를 이동시키는 함수입니다.
// n은 슬라이드를 이동할 수치를 나타냅니다.
function moveSlide(n) {
  showSlides(slideIndex += n);
}

// 슬라이드를 표시하는 함수입니다.
// n은 표시할 슬라이드의 인덱스입니다.
function showSlides(n) {
  let i;
  // 클래스 이름이 "slide"인 모든 요소를 가져옵니다.
  let slides = document.getElementsByClassName("slide");

  // 슬라이드 인덱스가 슬라이드 개수보다 크면 슬라이드 인덱스를 1로 설정합니다.
  if (n > slides.length) {
    slideIndex = 1;
  }

  // 슬라이드 인덱스가 1보다 작으면 슬라이드 인덱스를 슬라이드 개수로 설정합니다.
  if (n < 1) {
    slideIndex = slides.length;
  }

  // 모든 슬라이드를 보이지 않도록 설정합니다.
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  // 현재 슬라이드 인덱스에 해당하는 슬라이드를 표시합니다.
  slides[slideIndex - 1].style.display = "block";
}
