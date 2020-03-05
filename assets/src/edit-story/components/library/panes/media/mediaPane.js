/*
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

/**
 * External dependencies
 */
import styled from 'styled-components';
import { useEffect } from 'react';
import { rgba } from 'polished';

/**
 * WordPress dependencies
 */
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { useConfig } from '../../../../app/config';
import { useMedia } from '../../../../app/media';
import { useMediaPicker } from '../../../mediaPicker';
import { MainButton, Title, SearchInput, Header } from '../../common';
import Dropzone from '../../dropzone';
import useLibrary from '../../useLibrary';
import { Pane } from '../shared';
import paneId from './paneId';
import { isEven, getResourceFromMediaPicker } from './mediaUtils';
import MediaElement from './mediaElement';

const Container = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: 1fr 1fr;
`;

const Column = styled.div``;

const Message = styled.div`
  color: ${({ theme }) => theme.colors.fg.v1};
  font-size: 16px;
`;

const FilterButtons = styled.div`
  border-bottom: 1px solid ${({ theme }) => rgba(theme.colors.fg.v1, 0.1)};
  padding: 18px 0;
  margin: 10px 0 15px;
`;

const FilterButton = styled.button`
  border: 0;
  background: none;
  padding: 0;
  margin: 0 18px 0 0;
  color: ${({ theme, active }) =>
    active ? theme.colors.fg.v1 : theme.colors.mg.v1};
  font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
  font-size: 13px;
  text-transform: uppercase;
`;

const FILTERS = [
  { filter: '', name: __('All', 'web-stories') },
  { filter: 'image', name: __('Images', 'web-stories') },
  { filter: 'video', name: __('Video', 'web-stories') },
];

const DEFAULT_WIDTH = 150;

function MediaPane(props) {
  const {
    state: { media, isMediaLoading, isMediaLoaded, mediaType, searchTerm },
    actions: {
      loadMedia,
      reloadMedia,
      resetMedia,
      setMediaType,
      setSearchTerm,
      uploadVideoFrame,
    },
  } = useMedia();
  const {
    allowedMimeTypes: {
      image: allowedImageMimeTypes,
      video: allowedVideoMimeTypes,
    },
  } = useConfig();
  const {
    actions: { insertElement },
  } = useLibrary();

  useEffect(loadMedia);

  const onClose = resetMedia;

  /**
   * Callback of select in media picker to insert media element.
   *
   * @param {Object} attachment Attachment object from backbone media picker.
   */
  const onSelect = (attachment) => {
    const resourceType = allowedImageMimeTypes.includes(attachment.mime)
      ? 'image'
      : 'video';
    const resource = getResourceFromMediaPicker(attachment);
    const height = DEFAULT_WIDTH / (resource.width / resource.height);

    insertMediaElement(resourceType, resource, DEFAULT_WIDTH, height);
  };

  const openMediaPicker = useMediaPicker({
    onSelect,
    onClose,
  });

  /**
   * Handle search term changes.
   *
   * @param {Object} evt Doc Event
   */
  const onSearch = (evt) => {
    setSearchTerm(evt.target.value);
    reloadMedia();
  };

  /**
   * Filter REST API calls and re-request API.
   *
   * @param {string} filter Value that is passed to rest api to filter.
   */
  const onFilter = (filter) => {
    if (filter !== mediaType) {
      setMediaType(filter);
      reloadMedia();
    }
  };

  /**
   * Insert element such image, video and audio into the editor.
   *
   * @param {string} type Resource type
   * @param {Object} resource Resource object
   * @param {number} width Width that element is inserted into editor.
   * @param {number} height Height that element is inserted into editor.
   * @return {null|*} Return onInsert or null.
   */
  const insertMediaElement = (type, resource, width, height) => {
    const element = insertElement(type, {
      resource,
      width,
      height,
      x: 5,
      y: 5,
      rotationAngle: 0,
    });

    // Generate video poster if one not set.
    if (type === 'video' && resource.videoId && !resource.posterId) {
      uploadVideoFrame(resource.videoId, resource.src, element.id);
    }

    return element;
  };

  const filteredMedia = media.filter(
    ({ mimeType }) =>
      allowedImageMimeTypes.includes(mimeType) ||
      allowedVideoMimeTypes.includes(mimeType)
  );

  return (
    <Pane id={paneId} {...props}>
      <Dropzone>
        <Header>
          <Title>
            {__('Media', 'web-stories')}
            {(!isMediaLoaded || isMediaLoading) && <Spinner />}
          </Title>
          <MainButton onClick={openMediaPicker}>
            {__('Upload', 'web-stories')}
          </MainButton>
        </Header>

        <SearchInput
          value={searchTerm}
          placeholder={__('Search media...', 'web-stories')}
          onChange={onSearch}
        />

        <FilterButtons>
          {FILTERS.map(({ filter, name }, index) => (
            <FilterButton
              key={index}
              active={filter === mediaType}
              onClick={() => onFilter(filter)}
            >
              {name}
            </FilterButton>
          ))}
        </FilterButtons>

        {isMediaLoaded && !media.length ? (
          <Message>{__('No media found', 'web-stories')}</Message>
        ) : (
          <Container>
            <Column>
              {filteredMedia
                .filter((_, index) => isEven(index))
                .map((attachment) => (
                  <MediaElement
                    key={attachment.src}
                    attachment={attachment}
                    width={DEFAULT_WIDTH}
                    onInsert={insertMediaElement}
                  />
                ))}
            </Column>
            <Column>
              {filteredMedia
                .filter((_, index) => !isEven(index))
                .map((attachment) => (
                  <MediaElement
                    key={attachment.src}
                    attachment={attachment}
                    width={DEFAULT_WIDTH}
                    onInsert={insertMediaElement}
                  />
                ))}
            </Column>
          </Container>
        )}
      </Dropzone>
    </Pane>
  );
}

export default MediaPane;
