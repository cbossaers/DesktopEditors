    FILE_DRAW:              FILE_DRAW,
    FILE_DRAW_VSDX:         FILE_DRAW + 0x0001,
    FILE_DRAW_VSSX:         FILE_DRAW + 0x0002,
    FILE_DRAW_VSTX:         FILE_DRAW + 0x0003,
    FILE_DRAW_VSDM:         FILE_DRAW + 0x0004,
    FILE_DRAW_VSSM:         FILE_DRAW + 0x0005,
    FILE_DRAW_VSTM:         FILE_DRAW + 0x0006,
};

utils.defines.DBLCLICK_LOCK_TIMEOUT = 800;

// Offline build: disable registration and password-recovery links.
utils.defines.links = {
    regnew: '',
    restorepass: ''
};

utils.formatToEditor = function(f) {
    if ( f > FILE_PRESENTATION && f < FILE_SPREADSHEET ) return 'slide'; else
    if ( f > FILE_SPREADSHEET && f < FILE_CROSSPLATFORM ) return 'cell'; else
    if ( f > FILE_CROSSPLATFORM || f === utils.defines.FileFormat.FILE_DOCUMENT_OFORM_PDF ) return 'pdf'; 
    else return 'word';
}

utils.parseFileFormat = function(format) {
    switch (format) {
    case utils.defines.FileFormat.FILE_DOCUMENT_DOC:        return 'doc';
    case utils.defines.FileFormat.FILE_DOCUMENT_DOCX:       return 'docx';
