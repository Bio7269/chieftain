#!/usr/bin/env python
# encoding: utf-8
"""
rebuild_cache.py

Created by Paul Bagwell on 2011-04-16.
Copyright (c) 2011 Paul Bagwell. All rights reserved.
"""
import shutil
from django.core.cache import cache
from django.core.management.base import BaseCommand
from board.models import Thread, Post
from board.tools import print_flush


class Command(BaseCommand):
    def handle(self, *args, **options):
        """Rebuilds cache."""
        shutil.rmtree('cache', ignore_errors=True)
        for c, thread in enumerate(Thread.objects.all()):
            thread.save()
            print_flush('Rendered thread {0}'.format(c))
        for c, post in enumerate(Post.objects.all()):
            post.save()
            print_flush('Rendered post {0}'.format(c))
        cache.clear()
