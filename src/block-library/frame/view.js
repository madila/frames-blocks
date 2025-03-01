window.addEventListener('DOMContentLoaded', () => {

    const AUTOPLAY_SPEED = 3000;
    const TRANSITION_SPEED = 300;

    const triggerEvent = (index, target, scroll = true) => {
        const event = new CustomEvent("frame-change-step", {
            bubbles: true,
            detail: { getIndex: () => index, scroll: scroll },
        });
        target.dispatchEvent(event);
    }

    const init = (frame) => {

        /*
         * Declare core elements
         */

        const Navigation = frame.querySelector('.wp-block-frames-navigation');
        const Dots = [...Navigation.querySelectorAll('.wp-block-frames-navigation-dot')];
        const Slider = frame.querySelector('.wp-block-frames-frame');

        const Children = [...Slider.querySelectorAll(':scope > [class^="wp-block-"]')];

        const AutoPlay = ('autoplay' in frame.dataset && frame.dataset.autoplay === "true");

        console.log(Children, AutoPlay);

        let autoplayIntervalId = null;
        const stopAutoplay = () => {
            clearInterval(autoplayIntervalId);
            autoplayIntervalId = null;
        }

        const AppendChild = Children[0].cloneNode(true);
        const AppendDot = Dots[0].cloneNode(true);
        AppendDot.dataset.index = String(Children.length);
        AppendDot.textContent = String(Children.length);
        Slider.appendChild(AppendChild);
        Children.push(AppendChild);
        Navigation.appendChild(AppendDot);
        Dots.push(AppendDot);

        const getActiveDot = () => {
            return frame.querySelector('.wp-block-frames-navigation-dot.active');
        }

        const resetCurrentStep = (e = null, scroll = true) => {
            const activeDot = getActiveDot();
            if(activeDot) {
                const activeDotIndex = 'index' in activeDot.dataset ? parseInt(activeDot.dataset.index) : 0;
                triggerEvent(activeDotIndex, activeDot, scroll);
            }
        }

        const resetSlider = (e = null) => {
            const { top, y, height } = Slider.getBoundingClientRect();
            const { innerHeight } = window;
            if(top > 0 && (y + height) <  innerHeight) {
                resetCurrentStep(e);
                document.removeEventListener('scrollend', resetSlider);
            }
        }

        const setAutoplayInterval = ()  => {
            if (!autoplayIntervalId) {
                autoplayIntervalId = setInterval(function () {

                    Slider.classList.add('user-scrolling');

                    const activeDot = getActiveDot();
                    if (activeDot) {
                        const activeDotIndex = 'index' in activeDot.dataset ? parseInt(activeDot.dataset.index) : 0;

                        const potentialNext = activeDotIndex + 1;
                        const goToIndex = (Children.length > potentialNext) ? potentialNext : 0;

                        if(!goToIndex) {
                            Slider.style.transitionDuration = '0s';
                            Slider.style.transform = `translateX(0px)`;
                        }

                        setNextStep(goToIndex);
                        document.addEventListener('scrollend', resetSlider);
                        resetCurrentStep();
                    }

                }, AUTOPLAY_SPEED + TRANSITION_SPEED);
            }
        }

        const updateCurrent = (index) => {
            Children.forEach((panel) => panel.removeAttribute('aria-current'));
            Dots.forEach((dot) => dot.classList.remove('active'));

            const currentDot = Dots[index];

            currentDot.classList.add('active');
            Children[index].setAttribute('aria-current', 'step');

            animateToNextSlide(index, false);
        }

        const snapHandler = (e) => {

            stopAutoplay();

            const atSnappingPoint = e.target.scrollLeft % e.target.offsetWidth === 0;
            const timeOut         = atSnappingPoint ? 0 : TRANSITION_SPEED; //see notes

            clearTimeout(e.target.scrollTimeout);

            e.target.scrollTimeout = setTimeout(function() {
                //using the timeOut to evaluate scrolling state
                Slider.classList.remove('user-scrolling');
                Slider.classList.remove('scrolling');
            }, timeOut);

        }


        /*
         * Remove classes on scroll end
         */

        /*
         * Change the active step as an event callback
         */

        frame.addEventListener("frame-change-step", (e) => {
            const { getIndex, scroll } = e.detail;
            const currentFrameIndex = getIndex();

            updateCurrent(currentFrameIndex);

            if(scroll) {
                Slider.classList.add('scrolling');
            }
        });

        const animateToNextSlide = (index, scroll, now = false) => {
            if(scroll) {
                Children[index].scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'center'});
            } else {

                Slider.style.transition = (!index) ? `none` : `transform ${TRANSITION_SPEED}ms linear`;
                Slider.style.transform = `translateX(-${Children[index].offsetLeft}px)`;

                if(AutoPlay) {
                    if (index === Children.length - 1) {
                        stopAutoplay();
                        setTimeout(function() {
                            setAutoplayInterval();
                        }, TRANSITION_SPEED);
                    }
                }
            }
        }

        /*
         * Ensure that user initiated scroll trigger the active change
         */

        Slider.addEventListener('scrollend', (e) => {

            const activeChildIndex = [...Children].findIndex((panel) => {
                const {left} = panel.getBoundingClientRect();
                return (left > 0 && left < innerWidth);
            });

            const activeDot = getActiveDot();
            const activeDotIndex = activeDot.dataset.index || -1;

            if(!Slider.classList.contains('user-scrolling') && activeChildIndex !== activeDotIndex) {
                updateCurrent(activeChildIndex);
            }

            Slider.classList.remove('user-scrolling');
            Slider.classList.remove('scrolling');

            document.addEventListener('scrollend', resetSlider);

        });

        const setNextStep = (goToIndex) => {
            Slider.classList.add('user-scrolling');

            Children.forEach((panel) => panel.removeAttribute('aria-current'));
            Dots.forEach((dot) => dot.classList.remove('active'));

            if(Dots.length > goToIndex) {
                Dots[goToIndex].classList.add('active');
            } else {

            }
            Children[goToIndex].setAttribute('aria-current', 'step');
        }


        /*
         * Activate the click event on the navigation dots
         */

        if(!Dots.length) return;
        Dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();

                stopAutoplay();

                const goToIndex = 'index' in e.target.dataset ? parseInt(e.target.dataset.index) : 0;

                setNextStep(goToIndex);
                document.addEventListener('scrollend', resetSlider);
                resetCurrentStep();

            });
        });

        /*
         * Set the initial slide as active
         */

        Slider.addEventListener('scroll', snapHandler);

        Children.forEach((panel, index) => panel.setAttribute('data-index', index.toString()));

        triggerEvent(0, Children[0], false);

        const checkAutoPlay = (entries) => {
            const entry = entries.length ? entries[0] : null;
            if(entry) {
                if(entry.isIntersecting) {
                    setAutoplayInterval();
                } else {
                    stopAutoplay();
                }
            }
        }


        if(AutoPlay) {
            Slider.style.pointerEvents = `none`;
            const framesObserver = new IntersectionObserver(checkAutoPlay, {});
            framesObserver.observe(frame);
        }

    }

    const frames = document.querySelectorAll('.wp-block-frames-container');
    frames.forEach((frame) => init(frame));

});
