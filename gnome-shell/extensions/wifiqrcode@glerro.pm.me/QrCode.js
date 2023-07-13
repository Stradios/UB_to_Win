/* -*- Mode: js; indent-tabs-mode: nil; js-basic-offset: 4; tab-width: 4; -*- */
/*
 * This file is part of Wifi QR Code.
 * https://gitlab.gnome.org/glerro/gnome-shell-extension-wifiqrcode
 *
 * QrCode.js
 *
 * Copyright (c) 2021-2023 Gianni Lerro {glerro} ~ <glerro@pm.me>
 *
 * Wifi QR Code is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wifi QR Code is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with Wifi QR Code. If not, see <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 * SPDX-FileCopyrightText: 2021-2023 Gianni Lerro <glerro@pm.me>
 */

/* exported QrCodeBox, QrCodeActor */

'use strict';

const Cairo = imports.cairo;
const ByteArray = imports.byteArray;

const {Clutter, Gio, GObject, NM, St} = imports.gi;

const Main = imports.ui.main;
const MessageTray = imports.ui.messageTray;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const ExtensionName = Me.metadata.name;

const _ = ExtensionUtils.gettext;

const QrCodeGen = Me.imports.libs.qrcodegen;

const MIN_SQUARE_SIZE = 1.0;
const MIN_BORDER = 1;
const MIN_WIDTH = 150;

// Extend the BoxLayout class from St.
var QrCodeBox = GObject.registerClass({
    GTypeName: 'QrCodeBox',
}, class QrCodeBox extends St.BoxLayout {
    _init(device, isVisible = true) {
        super._init({
            vertical: true,
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
            y_expand: true,
            x_expand: true,
            style: 'padding-bottom: 10px;',
            visible: isVisible,
        });

        let _qrCodeActor = new QrCodeActor(this._getWifiSettingsString(device), 200, 2);
        this.add_actor(_qrCodeActor);
    }

    _getWifiSettingsString(device) {
        log(`${ExtensionName}: Collecting Wifi Settings`);

        // device is a NM.Device class
        let _device = device;

        // Return an NM.activeConnection class or null if the device is
        // not part of an active connection.
        let _activeConnection = _device.get_active_connection();
        if (!_activeConnection)
            return null;

        // Return the NM.RemoteConnection which this NM.ActiveConnection
        // is an active instance of.
        let _remoteConnection = _activeConnection.get_connection();
        if (!_remoteConnection)
            return null;

        // Return an NM.SettingWireless if the connection contains one or null
        let _setting = _remoteConnection.get_setting_wireless();
        if (!_setting)
            return null;

        let _qrCodeString = 'WIFI:';

        /* SSID */
        let _ssid = ByteArray.toString(_setting.get_ssid().get_data());
        if (!_ssid)
            return null;

        _qrCodeString = `${_qrCodeString}S:${_ssid};`;

        // Return an NM.SettingWirelessSecurity if the connection contains one or null
        let _securitySetting = _remoteConnection.get_setting_wireless_security();
        if (!_securitySetting)
            return null;

        /* Security Type */
        let _securityType = 'nopass';
        if (_securitySetting.get_key_mgmt() === 'wpa-psk' || _securitySetting.get_key_mgmt() === 'wpa-none' ||
            _securitySetting.get_key_mgmt() === 'sae') // WPA3 Personal
            _securityType = 'WPA';
        else if (_securitySetting.get_key_mgmt() === 'none')
            _securityType = 'WEP';

        _qrCodeString = `${_qrCodeString}T:${_securityType};`;

        /* Password */
        let _password = '';
        if (_securityType !== 'nopass') {
            try {
                let _secrets = _remoteConnection.get_secrets(NM.SETTING_WIRELESS_SECURITY_SETTING_NAME, null);
                _remoteConnection.update_secrets(NM.SETTING_WIRELESS_SECURITY_SETTING_NAME, _secrets);
            } catch (e) {
                logError(e.message, 'Wifi QR Code');
                return null;
            }

            if (_securityType === 'WPA') {
                /* WPA Password */
                _password = _securitySetting.get_psk();
            } else if (_securityType === 'WEP') {
                /* WEP Password */
                let _wepIndex = _securitySetting.get_wep_tx_keyidx();
                _password = _securitySetting.get_wep_key(_wepIndex);
            }
        }

        _qrCodeString = `${_qrCodeString}P:${_password};`;

        /* WiFi Hidden */
        if (_setting.get_hidden())
            _qrCodeString = `${_qrCodeString}H:true;;`;
        else
            _qrCodeString = `${_qrCodeString}H:false;;`;

        return _qrCodeString;
    }
});

// Extend the Actor class from Clutter.
var QrCodeActor = GObject.registerClass({
    GTypeName: 'QrCodeActor',
}, class QrCodeActor extends Clutter.Actor {
    _init(qrcodetext = 'Invalid Text', size = 100, border = 2) {
        super._init({
            layout_manager: new Clutter.BinLayout(),
            clip_to_allocation: true,
            reactive: true,
        });

        log(`${ExtensionName}: Generating Wifi QR Code`);

        // Define local variables
        this._qrcodetext = qrcodetext;
        this._size = size < MIN_WIDTH ? MIN_WIDTH : size;
        this._border = border < MIN_BORDER ? MIN_BORDER : border;

        // Generate the QR Code
        let QRC = QrCodeGen.qrcodegen.QrCode;
        this._qrcode = QRC.encodeText(this._qrcodetext, QRC.Ecc.MEDIUM);

        if (this._qrcode !== null || this._qrcode !== undefined) {
            // Create a 2D canvas, courtesy of Clutter
            this.canvas = new Clutter.Canvas();
            this.canvas.set_size(this._size, this._size);

            // Add the canvas to the Clutter Actor
            this.set_content(this.canvas);
            this.set_size(this._size, this._size);

            // Connect the draw signal to the draw function
            this.canvas.connect('draw',  (canvas, cr, width, height) => this.draw(canvas, cr, width, height));

            // Invalidate the canvas to emitt the draw signal
            this.canvas.invalidate();
        } else {
            log(`${ExtensionName}: An error occurred generating the QR Code`);
        }
    }

    // Copy QR Code to the Clipboard
    vfunc_event(event) {
        if (event.type() === Clutter.EventType.BUTTON_PRESS) {
            if (event.get_button() === 3) {
                let _qrSize = this._qrcode.size;
                let _size = this._size * 2;
                let _border = this._border;

                let _rowSize = _border + _qrSize + _border;
                let _squareSize = (_size / _rowSize) < MIN_SQUARE_SIZE ? MIN_SQUARE_SIZE : _size / _rowSize;

                let surface = new Cairo.ImageSurface(Cairo.Format.ARGB32, _size, _size);
                let cr = new Cairo.Context(surface);

                // Set Antialiasing mode to none (bilevel alpha mask)
                cr.setAntialias(Cairo.Antialias.NONE);

                // Draw a white background
                cr.setSourceRGBA(1, 1, 1, 1);
                cr.rectangle(0, 0, _size, _size);
                cr.fill();

                // Now draw the black QR Code pixels
                for (let iy = _border; iy < (_rowSize - _border); iy++) {
                    for (let ix = _border; ix < (_rowSize - _border); ix++) {
                        if (this._qrcode.getModule(ix - _border, iy - _border)) {
                            cr.setSourceRGBA(0.0, 0.0, 0.0, 1.0);
                            cr.rectangle(ix * _squareSize, iy * _squareSize, _squareSize, _squareSize);
                            cr.fill();
                        }
                    }
                }

                cr.$dispose();

                surface.writeToPNG(`${Me.path}/TmpQrCode.png`);

                const imageFile = Gio.File.new_for_path(`${Me.path}/TmpQrCode.png`);
                if (!imageFile.query_exists(null)) {
                    log(`${ExtensionName}: Temp file to copy in the clipboard not found`);
                    return;
                }

                const [bytes] = imageFile.load_bytes(null);
                const data = bytes.get_data();
                if (!data) {
                    log(`${ExtensionName}: Error reading temp file to copy in the clipboard`);
                    return;
                }

                bytes.unref();

                imageFile.delete(null);

                // Copy to Clipboard
                const Clipboard = St.Clipboard.get_default();
                const CLIPBOARD_TYPE = St.ClipboardType.CLIPBOARD;
                Clipboard.set_content(CLIPBOARD_TYPE, 'image/png', data);

                // Show Notification
                this._notifySource = new MessageTray.Source('', 'edit-paste-symbolic');
                this._notifySource.connect('destroy', () => (this._notifySource = null));
                Main.messageTray.add(this._notifySource);

                let notification = new MessageTray.Notification(this._notifySource, 'Wifi QR Code', _('QR Code copied to clipboard'));
                notification.setTransient(true);

                this._notifySource.showNotification(notification);
            }
        }
    }

    // Draw the QR Code into the Clutter.Actor content
    draw(canvas, cr, width, height) {
        let _qrSize = this._qrcode.size;
        let _border = this._border;

        let _rowSize = _border + _qrSize + _border;
        let _squareSize = (width / _rowSize) < MIN_SQUARE_SIZE ? MIN_SQUARE_SIZE : width / _rowSize;

        // Set Antialiasing mode to none (bilevel alpha mask)
        cr.setAntialias(Cairo.Antialias.NONE);

        // Draw a white background
        cr.setSourceRGBA(1, 1, 1, 1);
        cr.rectangle(0, 0, width, height);
        cr.fill();

        // Now draw the black QR Code pixels
        for (let iy = _border; iy < (_rowSize - _border); iy++) {
            for (let ix = _border; ix < (_rowSize - _border); ix++) {
                if (this._qrcode.getModule(ix - _border, iy - _border)) {
                    cr.setSourceRGBA(0.0, 0.0, 0.0, 1.0);
                    cr.rectangle(ix * _squareSize, iy * _squareSize, _squareSize, _squareSize);
                    cr.fill();
                }
            }
        }
        cr.$dispose();
        return true;
    }
});

