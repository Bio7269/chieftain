#!/usr/bin/env python
# encoding: utf-8
"""
views.py

Created by Paul Bagwell on 2011-03-01.
Copyright (c) 2011 Paul Bagwell. All rights reserved.
"""
from django.core.paginator import Paginator
from django.http import Http404, HttpResponsePermanentRedirect
from django.shortcuts import render, get_object_or_404
from board.models import *
from board.shortcuts import *


def index(request):
    return render(request, 'pda/index.html', add_sidebar())


def section(request, section_slug, page):
    """
    Gets 20 threads from current section with
    OP post and last 5 posts in each thread.
    """
    s = get_object_or_404(Section, slug=section_slug)
    p = get_page_or_404(Paginator(s.op_posts(), s.ONPAGE), page)
    return render(request, 'pda/section.html', {'section': s,
        'posts': p})


def thread(request, section_slug, op_post):
    """Thread and its posts."""
    post = get_object_or_404(Post, thread__section__slug=section_slug,
        pid=op_post)
    thread = post.thread
    if thread.is_deleted:
        raise Http404
    if not post.is_op_post:
        return HttpResponsePermanentRedirect('/{0}/{1}#post{2}'.format(
            thread.section, thread.op_post.pid, post.pid))
    return render(request, 'pda/thread.html', {'thread': thread})
