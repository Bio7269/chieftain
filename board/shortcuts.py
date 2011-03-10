#!/usr/bin/env python
# encoding: utf-8
"""
shortcuts.py

Created by Paul Bagwell on 2011-02-22.
Copyright (c) 2011 Paul Bagwell. All rights reserved.
"""

from django.core.paginator import InvalidPage, EmptyPage
from django.http import Http404
from django.shortcuts import render_to_response
from django.template import RequestContext

__all__ = ['get_page_or_404', 'update_context', 'rtr']


def get_page_or_404(paginator, page):
    """Gets page from Paginator instance or raises Http404 error."""
    try:
        return paginator.page(page)
    except (InvalidPage, EmptyPage):
        raise Http404


def update_context(context):
    """Updates context dictionary with sidebar."""
    from board.models import SectionGroup  # block recursive import
    context.update({'navigation': SectionGroup.objects.sections()})
    return context


def rtr(template, request, context={}, no_update=False):
    """Wrapper around render_to_response.

       Adds sidebar to all requests.
    """
    if not no_update:
        context = update_context(context)
    return render_to_response(template, context,
        context_instance=RequestContext(request))
