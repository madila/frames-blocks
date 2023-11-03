/* eslint-disable no-console */
console.log( 'Hello World! You got frames block!' );
/* eslint-enable no-console */

window.addEventListener('DOMContentLoaded', () => {

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
        const Dots = Navigation.querySelectorAll('.wp-block-frames-navigation-dot');
        const Slider = frame.querySelector('.wp-block-frames-frame__inner-container');
        const Children = frame.querySelectorAll('.wp-block-frames-frame__inner-container > .wp-block-group');

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

        const updateCurrent = (index) => {
            Children.forEach((panel) => panel.removeAttribute('aria-current'));
            Dots.forEach((dot) => dot.classList.remove('active'));

            Dots[index].classList.add('active');
            Children[index].setAttribute('aria-current', 'step');
        }

        /*
         * Change the active step as an event callback
         */

        frame.addEventListener("frame-change-step", (e) => {
            const { getIndex, scroll } = e.detail;
            const currentFrameIndex = getIndex();

            updateCurrent(currentFrameIndex);

            if(scroll) {
                Slider.classList.add('scrolling');
                Children[currentFrameIndex].scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'center'});
            }
        });

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

            document.addEventListener('scrollend', resetSlider);

            Slider.classList.remove('user-scrolling');

        });

        /*
         * Activate the click event on the navigation dots
         */

        if(!Dots.length) return;
        Dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();

                Slider.classList.add('user-scrolling');

                const goToIndex = 'index' in e.target.dataset ? parseInt(e.target.dataset.index) : 0;

                Children.forEach((panel) => panel.removeAttribute('aria-current'));
                Dots.forEach((dot) => dot.classList.remove('active'));

                Dots[goToIndex].classList.add('active');
                Children[goToIndex].setAttribute('aria-current', 'step');

                document.addEventListener('scrollend', resetSlider);

                resetCurrentStep();
            });
        });

        /*
         * Set the initial slide as active
         */

        Children.forEach((panel, index) => panel.setAttribute('data-index', index.toString()));

        triggerEvent(0, Children[0], false);

    }

    const frames = document.querySelectorAll('.wp-block-frames-frame.is-style-frames-slider');
    frames.forEach((frame) => init(frame));

});
