package org.mskcc.cbio.oncokb.config.application;

import java.util.List;

public class SentinelRedisCache {
    private String leaderName;
    private List<String> sentinelAddresses;

    public String getLeaderName() {
        return leaderName;
    }

    public void setLeaderName(String leaderName) {
        this.leaderName = leaderName;
    }

    public List<String> getSentinelAddresses() {
        return sentinelAddresses;
    }

    public void setSentinelAddresses(List<String> sentinelAddresses) {
        this.sentinelAddresses = sentinelAddresses;
    }
}
