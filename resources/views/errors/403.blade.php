@extends('errors.layout')

@section('code', '403')
@section('title', 'Akses Ditolak')
@section('message', $exception->getMessage() ?: 'Kamu tidak memiliki akses ke halaman ini.')
