   $('.team-slider').slick({
      dots: false,
      infinite: true,
      speed: 300,
      slidesToShow: 4,
      slidesToScroll: 1,
      arrows: false,
      responsive: [
         {
            breakpoint: 1024,
            settings: {
               slidesToShow: 3,
               slidesToScroll: 1,
               infinite: true,
               dots: true
            }
         },
         {
            breakpoint: 994,
            settings: {
               slidesToShow: 2,
               slidesToScroll: 1,
               dots: true
            }
         },
         {
            breakpoint: 600,
            settings: {
               slidesToShow: 1,
               slidesToScroll: 1,
               dots: true
            }
         }
      ]
   });
   $('.services-slider').slick({
      dots: false,
      infinite: true,
      speed: 300,
      slidesToShow: 3,
      slidesToScroll: 1,
      arrows: false,
      responsive: [
         {
            breakpoint: 1024,
            settings: {
               slidesToShow: 2,
               slidesToScroll: 1,
               infinite: true,
               dots: true
            }
         },
         {
            breakpoint: 994,
            settings: {
               slidesToShow: 1,
               slidesToScroll: 1,
               dots: true
            }
         }
      ]
   });
   
   $('.testimonial-slider').slick({
      arrows: false,
      dots: true
   });
   
   $('.works-slider').slick({
      dots: false,
      infinite: true,
      speed: 300,
      slidesToShow: 4,
      slidesToScroll: 1,
      arrows: false,
      responsive: [
         {
            breakpoint: 1200,
            settings: {
               slidesToShow: 3,
               slidesToScroll: 1,
               infinite: true,
               dots: true
            }
         },
         {
            breakpoint: 994,
            settings: {
               slidesToShow: 2,
               slidesToScroll: 1,
               dots: true
            }
         },
         {
            breakpoint: 768,
            settings: {
               slidesToShow: 1,
               slidesToScroll: 1,
               dots: true
            }
         }
      ]
   });
   
   $('.portfolio-slider').slick({
      vertical: true,
      verticalSwiping: true,
      arrows: false,
      dots: true,
      autoHeight: true,
      dotsClass: 'portfolio-dots',
      responsive: [
         {
            breakpoint: 994,
            settings: {
               verticalSwiping: false,
               
            }
         }
      ]
   });
   