// This file is part of Indico.
// Copyright (C) 2002 - 2025 CERN
//
// Indico is free software; you can redistribute it and/or
// modify it under the terms of the MIT License; see the
// LICENSE file for more details.

/* eslint no-shadow: ['warn', {allow: ['file']}] */

import Dropzone from 'dropzone';
import 'dropzone/dist/dropzone.css';

(function(global) {
  Dropzone.autoDiscover = false;
  global.Dropzone = Dropzone;

  // indicates whether default 'submit' handle was skipped
  let handlerSkipped = false;

  global.setupDropzone = function(element) {
    var $dz = $(element);
    var $form = $dz.closest('form');
    var $flashArea = $form.find('.flashed-messages');
    var options = {
      timeout: 0,
      clickable: element + ' .dropzone-inner',
      previewsContainer: element + ' .dropzone-previews',
      autoProcessQueue: false,

      init: function() {
        var $button = $form.find('input[type="submit"], .js-dropzone-upload');
        var self = this;
        var files = $dz.data('value');

        function addFile(file) {
          var existingFile = {
            name: file.filename,
            id: file.id,
            size: file.size,
            accepted: true,
          };

          self.emit('addedfile', existingFile);
          $dz.find('.dz-progress').hide();
          self.files.push(existingFile);

          /* Disable opening the upload dialog when clicking on the file's preview element */
          $dz.find('.dz-preview').on('click', function(e) {
            e.stopPropagation();
          });

          // Check if the existing file is an image and add the image preview.
          if (file.content_type.match(/image\/.*/) && file.url) {
            $dz.find('.dz-image > img').attr('src', file.url);
            $dz.find('.dz-image > img').attr('width', '120px');
            $dz
              .find('.dz-preview')
              .removeClass('dz-file-preview')
              .addClass('dz-image-preview');
          }
        }

        if (files) {
          if (options.uploadMultiple) {
            files.forEach(addFile);
          } else {
            addFile(files);
          }
        }

        // skip default ajaxForm submission when there are attachments
        // and it's ajax dialog to avoid double submission.
        $form.on('ajaxForm:validateBeforeSubmit', e => {
          const isAjaxDialog = !!$(e.target).closest('.exclusivePopup').length;
          if (self.getQueuedFiles().length && !handlerSkipped && isAjaxDialog) {
            e.preventDefault();
            handlerSkipped = true;
          }
        });

        $form.on('submit', function(e) {
          var evt = $.Event('ajaxForm:validateBeforeSubmit');
          $(this).trigger(evt);
          if (!evt.isDefaultPrevented()) {
            $button.prop('disabled', true);
            $.each(self.getRejectedFiles(), function(index, file) {
              self.removeFile(file);
            });
            if (self.getQueuedFiles().length) {
              e.preventDefault();
              e.stopPropagation();
              $dz.find('.dz-progress').show();
              self.processQueue();
            }
          }
          handlerSkipped = false;
        });

        self.on('addedfile', function(file) {
          if (!options.uploadMultiple && self.files.length > 1) {
            self.removeFile(self.files[0]);
          }

          // force change in form, so that we can process
          // the 'change' event
          $button.prop('disabled', false);
          $form.find('.change-trigger').val('added-file');
          $form.trigger('change');

          $dz.find('.dz-message').hide();
          $dz.find('.dz-progress').hide();
          $(file.previewElement).on('click', function(e) {
            e.stopPropagation();
          });
        });

        self.on('removedfile', function(file) {
          $button.prop('disabled', false);
          if (self.files.length === 0) {
            // force change in form, so that we can process the 'change' event
            $form.find('.change-trigger').val('no-file');
            $form.trigger('change');
            $dz.find('.dz-message').show();
          }

          if (options.editable) {
            var $field = $form.find('.deleted-files');
            var deletedFiles = JSON.parse($field.val());
            deletedFiles.push(file.id);
            $field.val(JSON.stringify(deletedFiles));
          }
        });

        self.on(options.uploadMultiple ? 'sendingmultiple' : 'sending', function() {
          $form.trigger('ajaxForm:beforeSubmit');
        });

        self.on(options.uploadMultiple ? 'successmultiple' : 'success', function(e, response) {
          if (options.handleFlashes) {
            handleFlashes(response, true, $flashArea);
          }

          $dz.data('value', response.content);
          $form.find('.change-trigger').val($dz.data('value') ? 'uploaded-file' : 'no-file');
          $form.trigger('indico:fieldsSaved', response);
          $form.trigger('ajaxForm:success', [response]);
        });

        self.on('error', function(e, msg, xhr) {
          if (xhr) {
            var evt = $.Event('ajaxForm:error');
            $form.trigger(evt, [xhr]);
            if (!evt.isDefaultPrevented()) {
              handleAjaxError(xhr);
            }
          }
        });
      },
    };

    _.extend(options, $dz.data('options'));
    var param = options.paramName;
    options.paramName = function() {
      return param;
    };

    // include the csrf token in case the dropzone is submitting data to a
    // seperate endpoint than the form's action
    if (options.url) {
      options.params = {
        csrf_token: $form.find('#csrf_token').val(),
      };
      $dz.dropzone(options);
    } else {
      $form.dropzone(options);
    }

    $form.data('dropzoneField', $dz[0]);
  };
})(window);
