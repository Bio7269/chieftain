#!/usr/bin/env python
# encoding: utf-8
"""
validators.py

Created by Paul Bagwell on 2011-02-07.
Copyright (c) 2011 Paul Bagwell. All rights reserved.
"""

from django.utils.translation import ugettext_lazy as _
from datetime import datetime
from board import tools
from board.models import Post, Thread, PostFormNoCaptcha, PostForm


class ValidationError(Exception):
    """Base class for all validation errors"""
    pass
        

class InvalidFileError(ValidationError):
    """Raised when user uploads file with bad type."""
    pass


class NotAuthenticatedError(ValidationError):
    """Raised when user posts in section, that requires auth."""
    pass


def attachment(file, section):
    """Attachment validator."""
    allowed = section.allowed_filetypes()
    if file.content_type not in allowed:
        raise InvalidFileError(_('Invalid file type'))
    if file.size > section.filesize_limit:
        raise InvalidFileError(_('Too big file'))
    return allowed[file.content_type]  # extension


def post(request, auth, no_captcha=True):
    """Makes various changes on new post creation.

       If there is no POST['thread'] specified, it will create
       new thread.
    """
    f = PostFormNoCaptcha if no_captcha else PostForm
    form = f(request.POST, request.FILES)
    if not form.is_valid():
        return False
    new_thread = not request.POST.get('thread')
    with_files = bool(request.FILES)

    post = form.save(commit=False)
    post.date = datetime.now()
    post.file_count = len(request.FILES)
    post.is_op_post = new_thread
    post.ip = request.META.get('REMOTE_ADDR') or '127.0.0.1'
    post.password = tools.key(post.password)
    if new_thread:
        thread = Thread(section_id=request.POST['section'], bump=post.date)
    else:
        thread = Thread.objects.get(id=request.POST['thread'])
    section_is_feed = (thread.section.type == 3)

    if section_is_feed and new_thread:  # if current section is feed
        if not request.user.is_authenticated():
            raise NotAuthenticatedError(_(
                'Authentication required to create threads in this section'
            ))
    if with_files:
        file = request.FILES['file']
        ext = attachment(f, t.section)
    if '#' in post.poster:  # make tripcode
        s = post.poster.split('#')
        post.tripcode = tools.tripcode(s.pop())
        post.poster = s[0]
    if not post.poster:
        post.poster = thread.section.default_name
    if not section_is_feed and new_thread:
        if post.email.lower() != 'sage':
            thread.bump = post.date
    if post.email == 'mvtn'.encode('rot13'):
        s = u'\u5350'
        post.poster = post.email = post.topic = s * 10
        post.message = (s + u' ') * 50
    if new_thread:
        thread.save(rebuild_cache=False)
        post.thread = thread
    post.pid = thread.section.pid_incr()
    if with_files:
        path, thumb_path = tools.handle_uploaded_file(file, ext, post)
    post.save()
    thread.save()
    return post
