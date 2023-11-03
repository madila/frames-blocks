<?php
/**
 * Plugin Name:     Frames Blocks
 * Plugin URI:      https://frames.rubenmadila.com
 * Description:     Additional Blocks for Wordpress Editor
 * Author:          Ruben Madila
 * Author URI:      https://rubenmadila.com
 * Text Domain:     frames-blocks
 * Domain Path:     /languages
 * Version:         0.1.1
 * GitHub Plugin URI: https://github.com/madila/frames-blocks
 * Primary Branch:  main
 *
 * @package         frames-blocks
 */


/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function frames_block_register_block_init() {
	register_block_type( __DIR__ . '/dist/js/block-library/frame' );
}
add_action( 'init', 'frames_block_register_block_init' );

/**
 * Enqueue scripts and styles.
 *
 * @since frames 1.0
 *
 * @return void
 */
function frames_blocks_client_scripts() {
	wp_enqueue_script( 'sca-plugin', plugin_dir_url(__FILE__).'dist/js/client/index.js', array(), null, true );

}
add_action( 'wp_enqueue_scripts', 'frames_blocks_client_scripts' );

function frames_blocks_block_scripts(): void {

	// Enqueue the block index.js file
	wp_enqueue_script(
		'sca-block',
		plugin_dir_url(__FILE__) . '/dist/js/block-filters/index.js',
		array('react', 'wp-block-editor', 'wp-components', 'wp-compose', 'wp-element', 'wp-hooks', 'wp-i18n') // required dependencies for blocks
	);

}
add_action( 'enqueue_block_editor_assets', 'frames_blocks_block_scripts' );


function frames_blocks_critical_css() {
	?>
	<style>
        [animation] {
            --frames--transition-properties: all;
            --frames--transition-duration: 350ms;
            --frames--transition-timing-function: ease-out;
            --frames--transition-delay: 0s;
            --frames--transition-stagger: 1;
            transition: var(--frames--transition-properties) var(--frames--transition-duration) var(--frames--transition-timing-function) var(--frames--transition-delay);
        }

        [animation]:not(.animated) {
            opacity: 0;
        }

        [animation="scale-up"]:not(.animated) {
            transform: scale(0.8);
        }

        [animation="scale-up"]:not(.animated) {
            transform: scale(0.8);
        }

        [animation="slide-up"]:not(.animated) {
            transform: translateY(25%);
        }

        [animation="slide-down"]:not(.animated) {
            transform: translateY(-25%);
        }

        [animation="slide-left"]:not(.animated) {
            transform: translateX(25%);
        }

        [animation="slide-right"]:not(.animated) {
            transform: translateX(-25%);
        }

        .wp-block-cover.has-parallax[animation]:not(.animated) .wp-block-cover__image-background {
            opacity: 0;
        }


        .wp-block-cover.has-parallax.animated .wp-block-cover__image-background {
            --frames--transition-properties: all;
            --frames--transition-duration: 300ms;
            --frames--transition-delay: calc(var(--frames--transition-duration) * 2);
            transition: var(--frames--transition-properties) var(--frames--transition-duration) var(--frames--transition-timing-function) var(--frames--transition-delay);
        }


        @keyframes fade-in {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        @keyframes slide-left {
            from {
                transform: translateX(25%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        [animation="scroll-driven"].animated {
            animation: auto linear both;
            animation-name: slide-left;
            animation-timeline: scroll(root block);
        }

        .animated .animated {
            --frames--transition-delay: calc(var(--frames--transition-duration) * var(--frames--transition-stagger));
        }

        .animated .animated .animated {
            --frames--transition-stagger: 1.3;
        }

        .animated .animated .animated {
            --frames--transition-stagger: 1.6;
        }

        .animated .animated .animated .animated {
            --frames--transition-stagger: 2;
        }

        .animated .animated .animated .animated {
            --frames--transition-stagger: 2.3;
        }

        @media (prefers-reduced-motion) {
            .wp-site-blocks .animated {
                --frames--transition-duration: 0s;
            }
        }

	</style>
	<?php
}

add_action('wp_head', 'frames_blocks_critical_css');
