<?php
/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

namespace Google\Web_Stories\Tests;

class Story_Renderer extends \WP_UnitTestCase {
	protected static $user;

	public static function wpSetUpBeforeClass( $factory ) {
		self::$user = $factory->user->create( [ 'role' => 'administrator' ] );
	}

	public function setUp() {
		// Avoids HTML in post_content being stripped because of lacking capabilities.
		wp_set_current_user( self::$user );
	}

	public function test_replace_html_start_tag() {
		$expected = '<html amp lang="en-US"><head></head><body></body></html>';
		$post     = self::factory()->post->create_and_get(
			[
				'post_content' => '<html><head></head><body></body></html>',
			] 
		);

		$renderer = new \Google\Web_Stories\Story_Renderer( $post );
		$actual   = $renderer->render();

		$this->assertSame( $expected, $actual );
	}

	public function test_replace_html_head() {
		$start_tag = '<meta name="web-stories-replace-head-start"/>';
		$end_tag   = '<meta name="web-stories-replace-head-end"/>';

		$post = self::factory()->post->create_and_get(
			[
				'post_content' => "<html><head>FOO{$start_tag}BAR{$end_tag}BAZ</head><body></body></html>",
			] 
		);

		$renderer = new \Google\Web_Stories\Story_Renderer( $post );
		$actual   = $renderer->render();

		$this->assertContains( 'FOO', $actual );
		$this->assertNotContains( 'BAR', $actual );
		$this->assertNotContains( $start_tag, $actual );
		$this->assertNotContains( $end_tag, $actual );
		$this->assertContains( '<style amp-custom>', $actual );
		$this->assertSame( 1, did_action( 'web_stories_story_head' ) );
	}
}