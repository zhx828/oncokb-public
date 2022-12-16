package org.mskcc.cbio.oncokb.service.dto.useradditionalinfo;

import java.time.Instant;
import java.io.Serializable;

/**
 * Created by Hongxin Zhang on 3/31/21.
 */
public class Activation implements Serializable{
    Instant initiationDate;
    String initiatedBy;
    Instant activationDate;
    String key;

    public Instant getInitiationDate() {
        return initiationDate;
    }

    public void setInitiationDate(Instant initiationDate) {
        this.initiationDate = initiationDate;
    }

    public String getInitiatedBy() {
        return initiatedBy;
    }

    public void setInitiatedBy(String initiatedBy) {
        this.initiatedBy = initiatedBy;
    }

    public Instant getActivationDate() {
        return activationDate;
    }

    public void setActivationDate(Instant activationDate) {
        this.activationDate = activationDate;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }
}
