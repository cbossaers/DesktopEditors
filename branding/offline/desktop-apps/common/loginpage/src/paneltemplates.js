            let locale = 'en';
            if (nl) {
                if (fallBack === 0) {
                    locale = nl.replace('_', '-'); 
                } else if (fallBack === 1) {
                    locale = nl.replace('_', '-').split('-')[0]; 
                }
            }

            page_num++;
            isCloudTmplsLoading = true;

            // Offline build: leave the templates domain empty so no network
            // request is issued for online templates. The local fallback is to
            // simply show nothing.
            const _domain = localStorage.templatesdomain ? localStorage.templatesdomain : '';
            if (!_domain) {
                isCloudTmplsLoading = false;
                return;
            }

            const _url = `${_domain}/dashboard/api/oforms?populate=*&locale=${locale}&pagination[page]=${page_num}`;
            fetch(_url)
                .then(r => r.json())
                .then(d => {
                    isCloudTmplsLoading = false;
                    if (d.data && d.data.length > 0) {
                        _on_add_cloud_templates.call(this, d.data);
                        const totalPages = d.meta.pagination.pageCount;
                        
                        if (page_num + 1 <= totalPages) {
                            _loadTemplates.call(this, nl, page_num, fallBack);
                        } 
                    } else if (d.data && d.data.length === 0 && fallBack < 2) {
                        _loadTemplates.call(this, nl, 0, fallBack + 1);
                    }
                })
                .catch (function (err) {
                    console.error(err);
