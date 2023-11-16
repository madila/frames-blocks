/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useInnerBlocksProps, useBlockProps } from '@wordpress/block-editor';

/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#save
 *
 * @return {WPElement} Element to render.
 */
export default function save( {attributes: { tagName: Tag, maxWidth: MaxWidth, navigation: Navigation, autoplay: AutoPlay } } ) {

	const blockProps = useBlockProps.save({
		style: {
			'--inner-group-max-width': MaxWidth
		}
	});

	const { children, ...innerBlocksProps } = useInnerBlocksProps.save( blockProps );

	let data = {};
	if(AutoPlay) {
		data['data-autoplay'] = true;
	}

	return (
		<Tag className="wp-block-frames-container" {...data}>
			<div className="wp-block-frames-slider">
				<div {...innerBlocksProps}>
					{ children }
				</div>
			</div>
			{Navigation && Navigation.length && <div className="wp-block-frames-frame wp-block-frames-navigation">
				{ Navigation.map((number, index) => {
					return <a href={`#slide-${index+1}`} data-index={index} className="wp-block-frames-navigation-dot">{index}</a>
				}) }
			</div>}
		</Tag>
	);
}
