<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSettingsRequest;
use App\Services\SettingsService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function __construct(
        private SettingsService $settings,
    ) {}

    public function index(): Response
    {
        return Inertia::render('Settings', [
            'settings' => $this->settings->all(),
            'defaults' => $this->settings->defaults(),
        ]);
    }

    public function update(UpdateSettingsRequest $request): RedirectResponse
    {
        $this->settings->set($request->validated());

        return back();
    }
}
